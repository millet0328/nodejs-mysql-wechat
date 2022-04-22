const express = require('express');
const router = express.Router();
// 数据库
let pool = require('../../config/mysql');

/**
 * @apiDefine Authorization
 * @apiHeader {String} Authorization 需在请求headers中设置Authorization: `Bearer ${token}`，登录/注册成功返回的token。
 */

/**
 * @api {post} /menu 添加菜单
 * @apiName MenuInsert
 * @apiGroup Menu
 * @apiPermission 后台系统
 *
 * @apiUse Authorization
 *
 * @apiBody {String} name 菜单名称.
 * @apiBody {String} component 关联组件名称.
 * @apiBody {Number} pId 父级id.
 * @apiBody {String} path 菜单url地址.
 * @apiBody {String} menu_order 菜单显示顺序，按照数字从小到大排序，如2001.
 *
 * @apiSampleRequest /menu
 */
router.post("/", async (req, res) => {
    let { name, pId, component, path, menu_order } = req.body;
    // 获取一个连接
    const connection = await pool.getConnection();

    try {
        // 开启事务
        await connection.beginTransaction();
        // 插入菜单
        let insert_menu_sql = `INSERT INTO MENU (name,pId,component,path,menu_order) VALUES (?,?,?,?,?) `;
        let [{ insertId, affectedRows: menu_affected_rows }] = await connection.query(insert_menu_sql, [name, pId, component, path, menu_order]);
        if (menu_affected_rows === 0) {
            await connection.rollback();
            res.json({ status: false, msg: "菜单menu创建失败！" });
            return;
        }
        // 新菜单需要添加进入超级管理员中
        let insert_role_sql = `INSERT INTO role_menu (role_id,menu_id) VALUES (1,?)`;
        let [{ affectedRows: role_affected_rows }] = await connection.query(insert_role_sql, [insertId]);
        if (role_affected_rows === 0) {
            await connection.rollback();
            res.json({ status: false, msg: "角色role_menu创建失败！" });
            return;
        }
        // 一切顺利，提交事务
        await connection.commit();
        // 创建成功
        res.json({
            status: true,
            msg: "创建成功!",
            data: { id: insertId }
        });
    } catch (error) {
        await connection.rollback();
        res.json({
            status: false,
            msg: error.message,
            error,
        });

    }
});
/**
 * @api {delete} /menu/:id 删除菜单
 * @apiName MenuDelete
 * @apiGroup Menu
 * @apiPermission 后台系统
 *
 * @apiUse Authorization
 *
 * @apiParam {Number} id 菜单id.
 *
 * @apiExample {js} 参数示例:
 * /menu/3
 *
 * @apiSampleRequest /menu
 */
router.delete("/:id", async (req, res) => {
    let { id } = req.params;
    let select_sql = 'SELECT * FROM MENU WHERE pId = ?';
    // 查询是否有子级菜单
    let [results] = await pool.query(select_sql, [id]);
    if (results.length > 0) {
        res.json({
            status: false,
            msg: "拥有子级菜单，不允许删除！"
        });
        return;
    }
    // 获取一个连接
    const connection = await pool.getConnection();

    try {
        // 开启事务
        await connection.beginTransaction();
        // 删除菜单
        let delete_menu_sql = `DELETE FROM MENU WHERE id = ?`;
        let [{ affectedRows: menu_affected_rows }] = await connection.query(delete_menu_sql, [id]);
        if (menu_affected_rows === 0) {
            await connection.rollback();
            res.json({ status: false, msg: "菜单menu删除失败！" });
            return;
        }

        // 删除角色中菜单
        let delete_role_sql = `DELETE FROM ROLE_MENU WHERE menu_id = ?`;
        await connection.query(delete_role_sql, [id]);

        // 一切顺利，提交事务
        await connection.commit();
        // 创建成功
        res.json({
            status: true,
            msg: "删除成功!",
        });
    } catch (error) {
        await connection.rollback();
        res.json({
            status: false,
            msg: error.message,
            error,
        });

    }
});
/**
 * @api {put} /menu/:id 更新菜单
 * @apiName MenuUpdate
 * @apiGroup Menu
 * @apiPermission 后台系统
 *
 * @apiUse Authorization
 *
 * @apiParam {Number} id 菜单id.
 * @apiBody {String} name 菜单名称.
 * @apiBody {String} component 关联组件名称.
 * @apiBody {Number} pId 父级id.
 * @apiBody {String} path 菜单url地址.
 * @apiBody {String} menu_order 菜单显示顺序，按照数字从小到大排序，如2001.
 *
 * @apiExample {js} 参数示例:
 * /menu/3
 *
 * @apiSampleRequest /menu/
 */
router.put("/:id", async (req, res) => {
    let { id } = req.params;
    let { name, pId, component, path, menu_order } = req.body;
    let sql = `UPDATE MENU SET name = ?,pId = ?,component = ?, path = ?, menu_order = ? WHERE id = ? `;
    let [{ affectedRows }] = await pool.query(sql, [name, pId, component, path, menu_order, id]);
    // 修改失败
    if (affectedRows === 0) {
        res.json({
            status: false,
            msg: "更新菜单失败！"
        });
        return;
    }
    // 修改成功
    res.json({
        status: true,
        msg: "更新菜单成功!"
    });
});
/**
 * @api {put} /menu/icon/:id 设置菜单图标
 * @apiName MenuUpdateIcon
 * @apiGroup Menu
 * @apiPermission 后台系统
 *
 * @apiUse Authorization
 *
 * @apiParam { Number } id 菜单id.
 * @apiBody { String } icon_id element图标id.
 *
 * @apiExample {js} 参数示例:
 * /menu/icon/3
 *
 * @apiSampleRequest /menu/icon
 */
router.put("/icon/:id", async (req, res) => {
    let { id } = req.params;
    let { icon_id } = req.body;
    let sql = `UPDATE MENU SET icon_id = ? WHERE id = ? `;
    let [{ affectedRows }] = await pool.query(sql, [icon_id, id]);
    // 修改失败
    if (affectedRows === 0) {
        res.json({
            status: false,
            msg: "设置图标失败！"
        });
        return;
    }
    // 修改成功
    res.json({
        status: true,
        msg: "设置图标成功!"
    });
});
/**
 * @api {get} /menu/sub 获取子级菜单
 * @apiName MenuSub
 * @apiGroup Menu
 * @apiPermission 后台系统
 *
 * @apiUse Authorization
 *
 * @apiQuery { Number } pId 父级菜单id。 注： 获取一级菜单pId = 1;
 *
 * @apiSampleRequest /menu/sub
 */
router.get("/sub", async (req, res) => {
    let { pId } = req.query;
    let sql = `SELECT m.*, i.name AS 'icon_name' FROM MENU m LEFT JOIN ICON i ON m.icon_id = i.id WHERE m.pId = ? ORDER BY m.menu_order`;
    let [results] = await pool.query(sql, [pId]);
    res.json({
        status: true,
        msg: "获取成功!",
        data: results
    });
});


/**
 * @api {get} /menu/all 获取所有菜单
 * @apiName AllMenu
 * @apiGroup Menu
 * @apiPermission 后台系统
 *
 * @apiUse Authorization
 *
 * @apiQuery { String="flat","tree" } [type="flat"] 返回数据格式。flat--扁平数组；tree--树形结构
 *
 * @apiSampleRequest /menu/all
 */
router.get('/all', async (req, res) => {
    let { type = 'flat' } = req.query;
    // 查询菜单
    let sql = `SELECT m.*, i.name AS 'icon_name' FROM MENU m LEFT JOIN ICON i ON m.icon_id = i.id ORDER BY menu_order`;
    let [results] = await pool.query(sql, []);
    // 扁平数组
    if (type === 'flat') {
        res.json({
            status: true,
            msg: "获取成功!",
            data: results
        });
        return;
    }
    // 树形结构
    if (type === 'tree') {
        // 筛选出一级菜单
        let menu_1st = results.filter((item) => item.pId === 0);
        // 转换为树形结构--递归函数
        const parseToTree = function (list) {
            return list.map((parent) => {
                let children = results.filter((child) => child.pId === parent.id);
                if (children.length) {
                    return { ...parent, children: parseToTree(children) }
                } else {
                    return { ...parent }
                }
            });
        }
        // 生成树形菜单
        let tree_menu = parseToTree(menu_1st);
        //成功
        res.json({
            status: true,
            msg: "获取成功!",
            data: tree_menu
        });
    }
});

module.exports = router;

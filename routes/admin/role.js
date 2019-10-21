const express = require('express');
const router = express.Router();
// 数据库
let db = require('../../config/mysql');
/**
 * @api {get} /api/role/list 获取角色列表
 * @apiName RoleList
 * @apiGroup admin-Role
 * @apiPermission admin
 *
 * @apiSampleRequest /api/role/list
 */
router.get('/list', function (req, res) {
    let sql = `SELECT id, role_name AS name FROM role`;
    db.query(sql, [], function (results) {
        // 获取成功
        res.json({
            status: true,
            msg: "获取成功！",
            data: results
        });
    });
});
/**
 * @api {post} /api/role 添加角色
 * @apiName RoleAdd
 * @apiGroup admin-Role
 * @apiPermission admin
 *
 * @apiParam {String} name 角色名称.
 *
 * @apiSampleRequest /api/role
 */
router.post('/', function (req, res) {
    let { name } = req.body;
    let sql = `INSERT INTO role (role_name) VALUES (?)`;
    db.query(sql, [name], function (results) {
        //成功
        res.json({
            status: true,
            msg: "success!",
            data: {
                id: results.insertId
            }
        });
    });
});
/**
 * @api {delete} /api/role 删除角色
 * @apiName RoleDelete
 * @apiGroup admin-Role
 * @apiPermission admin
 *
 * @apiParam {String} id 角色id.
 *
 * @apiSampleRequest /api/role
 */
router.delete('/', function (req, res) {
    let { id } = req.query;
    let sql = `DELETE FROM role WHERE id = ?`;
    db.query(sql, [id], function (results) {
        //成功
        res.json({
            status: true,
            msg: "success!",
        });
    });
});
/**
 * @api {put} /api/role 更新角色
 * @apiName RoleUpdate
 * @apiGroup admin-Role
 * @apiPermission admin
 *
 * @apiParam {String} id 角色id.
 * @apiParam {String} name 角色名称.
 *
 * @apiSampleRequest /api/role
 */
router.put('/', function (req, res) {
    let { id, name } = req.body;
    let sql = `UPDATE role SET role_name = ? WHERE id = ?`;
    db.query(sql, [name, id], function (results) {
        //成功
        res.json({
            status: true,
            msg: "success!",
        });
    });
});
/**
 * @api {get} /api/role/config 根据角色id获取菜单配置
 * @apiName LoadRoleMenu
 * @apiGroup admin-Role
 * @apiPermission admin
 *
 * @apiParam { Number } id 角色id。
 *
 * @apiSampleRequest /api/role/config
 */
router.get("/config", function (req, res) {
    let { id } = req.query;
    //获取所有菜单
    let sql = `SELECT id, name, path, menu_order AS 'order', pId FROM MENU ORDER BY menu_order;`;
    db.query(sql, [], (results) => {
        //添加菜单选择状态
        let sql = `SELECT m.* FROM MENU m JOIN role_menu rm ON rm.menu_id = m.id WHERE rm.role_id = ?`;
        db.query(sql, [id], function (menu) {
            results.forEach(item => {
                let flag = menu.find(element => {
                    return element.id === item.id;
                });
                item.checked = flag ? true : false;
            });
            //筛选出一级菜单
            let menu_1st = results.filter((item) => item.pId === 1 ? item : null);
            //递归循环数据
            parseToTree(menu_1st);
            //成功
            res.json({
                status: true,
                msg: "success!",
                data: menu_1st
            });
        });

        //递归函数
        function parseToTree(array) {
            array.forEach(function (parent) {
                parent.children = [];
                results.forEach(function (child) {
                    if (child.pId === parent.id) {
                        parent.children.push(child);
                    }
                });
                parseToTree(parent.children);
            });
        }
    });
});

/**
 * @api {post} /api/role/menu 为指定角色添加菜单
 * @apiName PutRoleMenu
 * @apiGroup admin-Role
 * @apiPermission admin
 *
 * @apiParam { Number } role_id 角色id。
 * @apiParam { Number } menu_id 菜单id。
 * @apiSampleRequest /api/role/menu
 */
router.post('/menu', function (req, res) {
    let { role_id, menu_id } = req.body;
    let sql = `INSERT INTO role_menu (role_id,menu_id) SELECT ?,? FROM DUAL WHERE NOT EXISTS (SELECT * FROM role_menu WHERE role_id = ? AND menu_id = ?)`;
    db.query(sql, [role_id, menu_id, role_id, menu_id], function (results) {
        //成功
        res.json({
            status: true,
            msg: "success!",
        });
    });
});

/**
 * @api {delete} /api/role/menu 为指定角色删除菜单
 * @apiName DeleteRoleMenu
 * @apiGroup admin-Role
 * @apiPermission admin
 *
 * @apiParam { Number } role_id 角色id。
 * @apiParam { Number } menu_id 菜单id。
 * @apiSampleRequest /api/role/menu
 */
router.delete('/menu', function (req, res) {
    let { role_id, menu_id } = req.query;
    let sql = `DELETE FROM role_menu WHERE role_id = ? AND menu_id = ?`;
    db.query(sql, [role_id, menu_id], function (results) {
        //成功
        res.json({
            status: true,
            msg: "success!",
        });
    });
});

module.exports = router;
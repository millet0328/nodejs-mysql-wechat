const express = require('express');
const router = express.Router();
// 数据库
let pool = require('../../config/mysql');
const fs = require('fs/promises');
const path = require("path");

/**
 * @api {get} /category/all 获取所有分类
 * @apiName allCategory
 * @apiGroup Category
 * @apiPermission admin
 *
 * @apiUse Authorization
 *
 * @apiQuery { String="flat","tree" } [type="flat"] 返回数据格式。flat--扁平数组；tree--树形结构
 *
 * @apiSampleRequest /category/all
 */

router.get("/all", async function (req, res) {
    let { type = 'flat' } = req.query;
    // 查询分类
    let sql = `SELECT * FROM CATEGORY`;
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
        let cate_1st = results.filter((item) => item.pId === 0);
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
        let tree_menu = parseToTree(cate_1st);
        // 返回数据
        res.json({
            status: true,
            msg: "获取成功!",
            data: tree_menu
        });
    }
});

/**
 * @api {post} /category 添加子分类
 * @apiName categoryAdd
 * @apiGroup Category
 * @apiPermission admin
 *
 * @apiUse Authorization
 *
 * @apiBody {String} name 分类名称.
 * @apiBody {Number} pId 父级id.
 * @apiBody {String} img 分类图片src地址.
 * @apiBody {Number} [level] 分类所在层级.
 *
 * @apiSampleRequest /category
 */
router.post("/", async function (req, res) {
    let { name, pId, level, img } = req.body;
    let sql = `INSERT INTO CATEGORY (name,pId,level,img) VALUES (?,?,?,?)`;
    let [{ insertId, affectedRows }] = await pool.query(sql, [name, pId, level, img]);
    // 添加失败
    if (affectedRows === 0) {
        res.json({
            status: false,
            msg: "添加失败！",
        });
        return;
    }
    // 添加成功
    res.json({
        status: true,
        msg: "添加成功！",
        data: { id: insertId }
    });
});
/**
 * @api {delete} /category/:id 删除分类
 * @apiName categoryDelete
 * @apiGroup Category
 * @apiPermission admin
 *
 * @apiUse Authorization
 *
 * @apiParam {Number} id 分类id.
 *
 * @apiExample {js} 参数示例:
 * /category/3
 *
 * @apiSampleRequest /category
 */
router.delete("/:id", async function (req, res) {
    let { id } = req.params;
    // 获取一个连接
    const connection = await pool.getConnection();
    try {
        // 开启事务
        await connection.beginTransaction();
        // 检查是否拥有子级分类
        let check_child_sql = 'SELECT * FROM category WHERE pId = ?';
        let [children] = await connection.query(check_child_sql, [id]);
        if (children.length > 0) {
            res.json({
                status: false,
                msg: "拥有子级分类，不允许删除！"
            });
            return;
        }
        // 查询分类图片
        let check_img_sql = `SELECT img FROM category WHERE id = ?`;
        let [results] = await connection.query(check_img_sql, [id]);
        let { img } = results[0];
        // 有分类图片，物理删除
        if (img) {
            // 计算真实路径
            let src = img.replace(/.+\/images/, "./images");
            let realPath = path.resolve(__dirname, '../../public/', src);
            // 物理删除
            await fs.unlink(realPath);
        }
        // 删除分类
        let delete_sql = `DELETE FROM CATEGORY WHERE id = ?`;
        let [{ affectedRows }] = await connection.query(delete_sql, [id]);
        if (affectedRows === 0) {
            await connection.rollback();
            res.json({
                status: false,
                msg: "删除分类失败！"
            });
            return;
        }
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
 * @api {put} /category/:id 更新分类
 * @apiName updateCategory
 * @apiGroup Category
 * @apiPermission admin
 *
 * @apiUse Authorization
 *
 * @apiParam {Number} id 分类id.
 * @apiBody {String} name 分类名称.
 * @apiBody {String} img 分类图片src地址.
 *
 * @apiExample {js} 参数示例:
 * /category/3
 *
 * @apiSampleRequest /category
 */
router.put("/:id", async function (req, res) {
    let { id } = req.params;
    let { name, img } = req.body;
    let sql = `UPDATE CATEGORY SET name = ?, img = ? WHERE id = ?`;
    let [{ affectedRows }] = await pool.query(sql, [name, img, id]);
    // 修改失败
    if (affectedRows === 0) {
        res.json({
            status: false,
            msg: "修改失败！"
        });
        return;
    }
    // 修改成功
    res.json({
        status: true,
        msg: "修改成功!"
    });
});
/**
 * @api {get} /category/sub 获取子级分类
 * @apiName categorySub
 * @apiGroup Category
 * @apiPermission admin user
 *
 * @apiUse Authorization
 *
 * @apiQuery {Number} pId 父级分类id。注：获取一级分类pId = 1，获取根分类pId = 0;
 *
 * @apiSampleRequest /category/sub
 */
router.get("/sub", async function (req, res) {
    let { pId } = req.query;
    let sql = `SELECT * FROM CATEGORY WHERE pId = ?`;
    let [results] = await pool.query(sql, [pId]);
    //成功
    res.json({
        status: true,
        msg: "success!",
        data: results
    });
});

module.exports = router;
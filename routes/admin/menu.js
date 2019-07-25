const express = require('express');
const router = express.Router();
// 数据库
let db = require('../../config/mysql');

/**
 * @api {post} /api/menu/add/ 添加子菜单
 * @apiName MenuAdd
 * @apiGroup admin-Menu
 * @apiPermission admin
 *
 * @apiParam {String} name 分类名称.
 * @apiParam {Number} pId 父级id.
 * @apiParam {String} path 菜单url地址.
 * @apiParam {String} order 菜单显示顺序，按照数字从小到大排序，如2001.
 *
 * @apiSampleRequest /api/menu/add/
 */
router.post("/menu/add", function (req, res) {
    let {name, pId, path, order} = req.body;
    let sql = `INSERT INTO MENU (name,pId,path,menu_order) VALUES (?,?,?,?) `;
    db.query(sql, [name, pId, path, order], function (results, fields) {
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
 * @api {post} /api/menu/delete/ 删除子菜单
 * @apiName MenuDelete
 * @apiGroup admin-Menu
 * @apiPermission admin
 *
 * @apiParam {Number} id 子菜单id.
 *
 * @apiSampleRequest /api/menu/delete/
 */
router.post("/menu/delete", function (req, res) {
    let sql = `DELETE FROM MENU WHERE id = ?`;
    db.query(sql, [req.body.id], function (results, fields) {
        //成功
        res.json({
            status: true,
            msg: "success!"
        });
    });
});
/**
 * @api {post} /api/menu/update/ 更新子菜单
 * @apiName MenuUpdate
 * @apiGroup admin-Menu
 * @apiPermission admin
 *
 * @apiParam {Number} id 子菜单id.
 * @apiParam { String } name 子菜单名称.
 * @apiParam { String } path 子菜单url地址.
 *
 * @apiSampleRequest /api/menu/update/
 */
router.post("/menu/update", function (req, res) {
    let {name, path, id, order} = req.body;
    let sql = `UPDATE MENU SET name = ? , path = ?, menu_order = ? WHERE id = ? `;
    db.query(sql, [name, path, order, id], function (results, fields) {
        //成功
        res.json({
            status: true,
            msg: "success!"
        });
    });
});
/**
 * @api {get} /api/menu/sub/ 获取子级菜单
 * @apiName MenuSub
 * @apiGroup admin-Menu
 * @apiPermission admin
 *
 * @apiParam { Number } pId 父级菜单id。 注： 获取一级菜单pId = 1;
 *
 * @apiSampleRequest /api/menu/sub/
 */
router.get("/menu/sub/", function (req, res) {
    let sql = `SELECT id, name, path, menu_order AS 'order', pId FROM MENU WHERE pId = ? ORDER BY menu_order`;
    db.query(sql, [req.query.pId], function (results, fields) {
        //成功
        res.json({
            status: true,
            msg: "success!",
            data: results
        });
    });
});
/**
 * @api {get} /api/menu/tree/ 根据角色id获取侧边栏树形菜单
 * @apiName TreeMenu
 * @apiGroup admin-Menu
 * @apiPermission admin
 *
 * @apiParam {Number} id 角色id.
 *
 * @apiSampleRequest /api/menu/tree/
 */
router.get('/menu/tree', function (req, res) {
    let {id} = req.query;
    let sql = `SELECT m.* FROM MENU m JOIN role_menu rm ON rm.menu_id = m.id WHERE rm.role_id = ?`;
    db.query(sql, [id], function (results) {
        //筛选出一级菜单
        let menu_1st = results.filter((item) => item.pId === 1 ? item : null);
        //递归循环数据
        parseToTree(menu_1st);
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
        //成功
        res.json({
            status: true,
            msg: "success!",
            data: menu_1st
        });
    });
});
module.exports = router;
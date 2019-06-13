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
router.get('/role/list', function (req, res) {
    let sql = `SELECT * FROM role`;
    db.query(sql, [], function (results) {
        if (!results.length) {
            res.json({
                status: false,
                msg: "获取失败！"
            });
            return false;
        }
        // 获取成功
        res.json({
            status: true,
            msg: "获取成功！",
            data: results
        });
    });
});
/**
 * @api {post} /api/role/add 添加角色
 * @apiName RoleAdd
 * @apiGroup admin-Role
 * @apiPermission admin
 *
 * @apiParam {String} name 角色名称.
 *
 * @apiSampleRequest /api/role/add
 */
router.post('/role/add', function (req, res) {
    let {name} = req.body;
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
 * @api {post} /api/role/delete 删除角色
 * @apiName RoleDelete
 * @apiGroup admin-Role
 * @apiPermission admin
 *
 * @apiParam {String} id 角色id.
 *
 * @apiSampleRequest /api/role/delete
 */
router.post('/role/delete', function (req, res) {
    let {id} = req.body;
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
 * @api {post} /api/role/update 更新角色
 * @apiName RoleUpdate
 * @apiGroup admin-Role
 * @apiPermission admin
 *
 * @apiParam {String} id 角色id.
 * @apiParam {String} name 角色名称.
 *
 * @apiSampleRequest /api/role/update
 */
router.post('/role/update', function (req, res) {
    let {id, name} = req.body;
    let sql = `UPDATE role SET role_name = ? WHERE id = ?`;
    db.query(sql, [name, id], function (results) {
        //成功
        res.json({
            status: true,
            msg: "success!",
        });
    });
});

module.exports = router;
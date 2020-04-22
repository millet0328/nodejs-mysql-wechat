const express = require('express');
const router = express.Router();
// 数据库
let db = require('../../config/mysql');
/**
 * @api {post} /api/address 添加收货地址
 * @apiName addressAdd
 * @apiGroup Address
 * @apiPermission user
 * 
 * @apiParam {String} name 收货人姓名.
 * @apiParam {String} tel 电话.
 * @apiParam {String} province 省份.
 * @apiParam {String} city 市.
 * @apiParam {String} county 区县.
 * @apiParam {String} street 详细地址.
 * @apiParam {String} code 邮编.
 * @apiParam {Number=1,0} isDefault 是否默认 1-默认,0-否.
 *
 * @apiSampleRequest /api/address/
 */
router.post('/', function (req, res) {
    let sql;
    let { name, tel, province, city, county, street, code, isDefault } = req.body;
    let { openid } = req.user;
    if (isDefault == '1') {
        sql = `UPDATE address SET isDefault = 0 WHERE uid = '${openid}';
		INSERT INTO address(uid, name, tel, province, city, county, street, code, isDefault) VALUES(?,?,?,?,?,?,?,?,?);`
    } else {
        sql = `INSERT INTO address(uid, name, tel, province, city, county, street, code, isDefault) VALUES(?,?,?,?,?,?,?,?,?)`
    }
    db.query(sql, [openid, name, tel, province, city, county, street, code, isDefault], function (results) {
        res.json({
            status: true,
            msg: "添加成功！"
        });
    });
});
/**
 * @api {delete} /api/address/:id 删除收货地址
 * @apiName addressDelete
 * @apiGroup Address
 * @apiPermission user
 * 
 * @apiParam {Number} id 收货地址id.
 *
 * @apiSampleRequest /api/address
 */
router.delete("/:id", function (req, res) {
    let { id } = req.params;
    var sql = `DELETE FROM address WHERE id = ? `
    db.query(sql, [id], function (results) {
        res.json({
            status: true,
            data: results,
            msg: "删除成功！"
        });
    })
})
/**
 * @api {put} /api/address 修改收货地址
 * @apiName addressUpdate
 * @apiGroup Address
 * @apiPermission user
 
 * @apiParam {Number} id 收货地址id.
 * @apiParam {String} name 收货人姓名.
 * @apiParam {String} tel 电话.
 * @apiParam {String} province 省份.
 * @apiParam {String} city 市.
 * @apiParam {String} county 区县.
 * @apiParam {String} street 详细地址.
 * @apiParam {String} code 邮编.
 * @apiParam {Number=1,0} isDefault 是否默认.1-默认,0-否.
 *
 * @apiSampleRequest /api/address
 */
router.put("/", function (req, res) {
    let sql;
    let { id, name, tel, province, city, county, street, code, isDefault } = req.body;
    let { openid } = req.user;
    if (isDefault == '1') {
        sql = `UPDATE address SET isDefault = 0 WHERE uid = '${openid}';
		UPDATE address SET name = ?, tel = ?, province = ?, city = ?, county = ?, street = ?, code = ?, isDefault = ? WHERE id = ?;`
    } else {
        sql = `UPDATE address SET name = ?, tel = ?, province = ?, city = ?, county = ?, street = ?, code = ?, isDefault = ? WHERE id = ?`
    }
    db.query(sql, [name, tel, province, city, county, street, code, isDefault, id], function (results) {
        res.json({
            status: true,
            msg: "修改成功！"
        });
    });
});
/**
 * @api {get} /api/address/list 获取收货地址列表
 * @apiName addressList
 * @apiGroup Address
 * @apiPermission user
 * 
 * @apiSampleRequest /api/address/list
 */
router.get('/list', function (req, res) {
    let { openid } = req.user;
    var sql = 'SELECT * FROM address WHERE uid = ?'
    db.query(sql, [openid], function (results) {
        if (!results.length) {
            res.json({
                status: false,
                msg: "暂无收货地址！"
            });
            return false;
        }
        res.json({
            status: true,
            data: results,
            msg: "获取成功！"
        });
    })
});
/**
 * @api {get} /api/address 根据id获取收货地址详情
 * @apiName addressDetail
 * @apiGroup Address
 * @apiPermission user
 * 
 * @apiParam {Number} id 收货地址id.
 *
 * @apiSampleRequest /api/address
 */
router.get("/", function (req, res) {
    var sql = `SELECT * FROM address WHERE id = ? `;
    let { id } = req.query;
    db.query(sql, [id], function (results) {
        if (!results.length) {
            res.json({
                status: false,
                msg: "暂无收货地址信息！"
            });
            return false;
        }
        res.json({
            status: true,
            data: results[0],
            msg: "获取成功！"
        });
    })
});

module.exports = router;

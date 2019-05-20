var express = require('express');
var router = express.Router();
var request = require('request');
// JSON Web Token
var jwt = require("jsonwebtoken");
// 数据库
let db = require('../config/mysql');
// 微信小程序
let { appid, appSecret } = require("../config/wx");
/**
 * @api {post} /api/user/token/ 换取登录token
 * @apiDescription 微信小程序login之后，获得临时登录凭证code，再使用code换取登录token,请在头部headers中设置Authorization: `Bearer ${token}`,所有请求都必须携带token;
 * @apiName Token
 * @apiGroup User
 * 
 * @apiParam {String} code 微信临时登录凭证code.
 * 
 * @apiSampleRequest /api/user/token
 */
router.post('/user/token/', function(req, res) {
	let { code } = req.body;
	// 请求微信API
	let url =
		`https:/\/\api.weixin.qq.com/\sns/\jscode2session?appid=${appid}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;
	request(url, function(error, response, body) {
		if (error) {
			console.log(error);
			return;
		}
		if (response.statusCode != 200) {
			res.json({
				status: false,
				msg: response.statusMessage
			});
			return;
		}
		let data = JSON.parse(body);
		// 微信api返回错误
		if (data.errcode) {
			res.json({
				status: false,
				msg: data.errmsg
			});
			return;
		}
		// 生成token
		let token = jwt.sign(data, 'secret', { expiresIn: '1h' });
		// 查询数据库中是否有此openid
		let sql = 'SELECT * FROM users WHERE openid = ?';
		db.query(sql, [data.openid], function(results) {
			// 如果没有此openid，插入新的数据
			if (results.length == 0) {
				let sql = 'INSERT INTO users (openid,session_key) VALUES (?,?)';
				db.query(sql, [data.openid, data.session_key], function(results) {
					if (results.affectedRows > 0) {
						res.json({
							status: true,
							token: token
						});
						return;
					}
				});
			}
			// 如果有此openid，更新session_key的数据
			let sql = 'UPDATE users SET session_key = ? WHERE openid = ?';
			db.query(sql, [data.session_key, data.openid], function(results) {
				if (results.affectedRows > 0) {
					res.json({
						status: true,
						token: token
					});
					return;
				}
			});
		});
		// 解码token
		var decoded = jwt.verify(token, 'secret');

	});
});
/**
 * @api {post} /api/user/info/upload 上传微信用户信息
 * @apiName /info/upload 上传微信用户信息
 * @apiGroup User
 * 
 * @apiParam { String } nickName 用户昵称.
 * @apiParam { Number } gender 性别.
 * @apiParam { String } avatarUrl 头像.
 * @apiParam { String } country 国家.
 * @apiParam { String } province 省.
 * @apiParam { String } city 市.
 * 
 * @apiSampleRequest /api/user/info/upload
 */
router.post("/user/info/upload", function(req, res) {
	let { nickName, gender, avatarUrl, country, province, city } = req.body;
	let { openid } = req.user;
	let sql = `UPDATE users SET nickname = ?, sex = ?, avatar = ?, country = ?, province = ?, city = ? WHERE openid = ?`;
	db.query(sql, [nickName, gender, avatarUrl, country, province, city, openid], function(results) {
		if (results.affectedRows) {
			res.json({
				status: true,
				msg: "存储信息成功！",
			})
		}
	});
});

/**
 * @api {post} /api/address/add/ 添加收货地址
 * @apiName /address/add/
 * @apiGroup Address
 * 
 * @apiParam {Number} uid 用户id.
 * @apiParam {String} name 收货人姓名.
 * @apiParam {String} tel 电话.
 * @apiParam {String} province 省.
 * @apiParam {String} city 市.
 * @apiParam {String} area 区.
 * @apiParam {String} street 街道.
 * @apiParam {String} [code] 邮编.
 * @apiParam {Number} isDefault 是否默认 1-默认,0-否.
 * 
 * @apiSampleRequest /api/address/add/
 */
router.post('/address/add', function(req, res) {
	let sql;
	let isDefault = req.body.isDefault;
	if (isDefault == '1') {
		sql =`UPDATE addresses SET isDefault = 0 WHERE uid = ${req.body.uid};
		INSERT INTO addresses(uid,name,tel,province,city,area,street,code,isDefault) VALUES(?,?,?,?,?,?,?,?,?);`
	} else {
		sql = `INSERT INTO addresses(uid,name,tel,province,city,area,street,code,isDefault) VALUES(?,?,?,?,?,?,?,?,?)`
	}
	db.query(sql, [req.body.uid, req.body.name, req.body.tel, req.body.province, req.body.city, req.body.area, req.body.street,
		req.body.code, req.body.isDefault
	], function(results, fields) {
		res.json({
			status: true,
			msg: "添加成功！"
		});
	});
});
/**
 * @api {post} /api/address/delete/ 删除收货地址
 * @apiName /address/delete/
 * @apiGroup Address
 * 
 * @apiParam {Number} id 收货地址id.
 * 
 * @apiSampleRequest /api/address/delete/
 */
router.post("/address/delete/", function(req, res) {
	var sql = `DELETE FROM addresses WHERE id = ? `
	db.query(sql, [req.body.id], function(results, fields) {
		res.json({
			status: true,
			data: results,
			msg: "删除成功！"
		});
	})
})
/**
 * @api {post} /api/address/update/ 修改收货地址
 * @apiName /address/update/
 * @apiGroup Address
 * 
 * @apiParam {Number} id 收货地址id.
 * @apiParam {Number} uid 用户id.
 * @apiParam {String} name 收货人姓名.
 * @apiParam {String} tel 电话.
 * @apiParam {String} province 省.
 * @apiParam {String} city 市.
 * @apiParam {String} area 区.
 * @apiParam {String} street 街道.
 * @apiParam {String} [code] 邮编.
 * @apiParam {Number} isDefault 是否默认.1-默认,0-否.
 * 
 * @apiSampleRequest /api/address/update/
 */
router.post("/address/update/", function(req, res) {
	let sql;
	let isDefault = req.body.isDefault;
	if (isDefault == '1') {
		sql =
			`
		UPDATE addresses SET isDefault = 0 WHERE uid = ${req.body.uid};
		UPDATE addresses SET uid = ?,name = ?,tel = ?,province = ?,city = ?,area = ?,street = ?,code = ?,isDefault = ? WHERE id = ?;
		`
	} else {
		sql =
			`UPDATE addresses SET uid = ?,name = ?,tel = ?,province = ?,city = ?,area = ?,street = ?,code = ?,isDefault = ? WHERE id = ?`
	}
	db.query(sql, [req.body.uid, req.body.name, req.body.tel, req.body.province, req.body.city, req.body.area, req.body.street,
		req.body.code, req.body.isDefault, req.body.id
	], function(results, fields) {
		res.json({
			status: true,
			msg: "修改成功！"
		});
	});
})
/**
 * @api {get} /api/address/list/ 获取收货地址列表
 * @apiName /address/list/
 * @apiGroup Address
 * 
 * @apiParam {Number} uid 用户id.
 * 
 * @apiSampleRequest /api/address/list/
 */
router.get('/address/list', function(req, res) {
	var sql = `SELECT * FROM addresses WHERE uid = ? `
	db.query(sql, [req.query.uid], function(results, fields) {
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
 * @api {get} /api/address/detail/ 根据id获取收货地址详情
 * @apiName /address/detail/
 * @apiGroup Address
 * 
 * @apiParam {Number} id 收货地址id.
 * 
 * @apiSampleRequest /api/address/detail/
 */
router.get("/address/detail/", function(req, res) {
	var sql = `SELECT * FROM addresses WHERE id = ? `
	db.query(sql, [req.query.id], function(results, fields) {
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
})

module.exports = router;

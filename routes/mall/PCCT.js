const express = require('express');
const router = express.Router();
// 数据库
let db = require('../../config/mysql');

/**
 * @api {get} /api/pcct/province 获取所有省份
 * @apiName Province
 * @apiGroup Province-City-County-Town
 * @apiPermission admin
 * 
 * @apiSuccess {Object[]} data 省份数组.
 * @apiSuccess {String} data._id 数据库id，无用处.
 * @apiSuccess {String} data.name 省份名称.
 * @apiSuccess {String} data.province_id 省份id.
 * 
 * @apiSampleRequest /api/pcct/province
 */
router.get("/province", function (req, res) {
	let sql = 'SELECT * FROM province';
	db.query(sql, [], function (results) {
		//成功
		res.json({
			status: true,
			msg: "success!",
			data: results,
		});
	});
});

/**
 * @api {get} /api/pcct/city 根据省份id获取城市
 * @apiName City
 * @apiGroup Province-City-County-Town
 * @apiPermission admin
 * 
 * @apiParam {Number} id 省份id.
 * 
 * @apiSuccess {Object[]} data 市区数组.
 * @apiSuccess {String} data._id 数据库id，无用处.
 * @apiSuccess {String} data.name 城市名称.
 * @apiSuccess {String} data.city_id 城市id.
 * @apiSuccess {String} data.province_id 省份id.
 * 
 * @apiSampleRequest /api/pcct/city
 */
router.get("/city", function (req, res) {
	let { id } = req.query;
	let sql = 'SELECT * FROM city WHERE province_id = ?';
	db.query(sql, [id], function (results) {
		//成功
		res.json({
			status: true,
			msg: "success!",
			data: results,
		});
	});
});

/**
 * @api {get} /api/pcct/county 根据市区id获取县区
 * @apiName County
 * @apiGroup Province-City-County-Town
 * @apiPermission admin
 * 
 * @apiParam {Number} id 市区id.
 * 
 * @apiSuccess {Object[]} data 县区数组.
 * @apiSuccess {String} data._id 数据库id，无用处.
 * @apiSuccess {String} data.name 县区名称.
 * @apiSuccess {String} data.city_id 市区id.
 * @apiSuccess {String} data.county_id 县区id.
 * 
 * @apiSampleRequest /api/pcct/county
 */
router.get("/county", function (req, res) {
	let { id } = req.query;
	let sql = 'SELECT * FROM county WHERE city_id = ?';
	db.query(sql, [id], function (results) {
		//成功
		res.json({
			status: true,
			msg: "success!",
			data: results,
		});
	});
});

/**
 * @api {get} /api/pcct/town 根据县区id获取街道(镇)
 * @apiName Town
 * @apiGroup Province-City-County-Town
 * @apiPermission admin
 * 
 * @apiParam {Number} id 县区id.
 * 
 * @apiSuccess {Object[]} data 街道数组.
 * @apiSuccess {String} data._id 数据库id，无用处.
 * @apiSuccess {String} data.name 街道(镇)名称.
 * @apiSuccess {String} data.town_id 街道(镇)id.
 * @apiSuccess {String} data.county_id 县区id.
 * 
 * @apiSampleRequest /api/pcct/town
 */
router.get("/town", function (req, res) {
	let { id } = req.query;
	let sql = 'SELECT * FROM town WHERE county_id = ?';
	db.query(sql, [id], function (results) {
		//成功
		res.json({
			status: true,
			msg: "success!",
			data: results,
		});
	});
});

module.exports = router;

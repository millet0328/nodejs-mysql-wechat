const express = require('express');
const router = express.Router();
// 数据库
let pool = require('../../config/mysql');

/**
 * @apiDefine Authorization
 * @apiHeader {String} Authorization 需在请求headers中设置Authorization: `Bearer ${token}`，登录/注册成功返回的token。
 */

/**
 * @api {get} /pcct/province 获取所有省份
 * @apiName Province
 * @apiGroup Province-City-County-Town
 * @apiPermission admin
 *
 * @apiUse Authorization
 *
 * @apiSuccess {Object[]} data 省份数组.
 * @apiSuccess {String} data._id 数据库id，无用处.
 * @apiSuccess {String} data.name 省份名称.
 * @apiSuccess {String} data.province_id 省份id.
 *
 * @apiSampleRequest /pcct/province
 */
router.get("/province", async (req, res) => {
    try {
        let sql = 'SELECT * FROM province';
        let [results] = await pool.query(sql, []);
        //成功
        res.json({
            status: true,
            msg: "success!",
            data: results,
        });
    } catch (error) {
        res.json({
            status: false,
            msg: error.message,
            error,
        });
    }
});

/**
 * @api {get} /pcct/city 根据省份id获取城市
 * @apiName City
 * @apiGroup Province-City-County-Town
 * @apiPermission admin
 *
 * @apiUse Authorization
 *
 * @apiQuery {Number} id 省份id.
 *
 * @apiSuccess {Object[]} data 市区数组.
 * @apiSuccess {String} data._id 数据库id，无用处.
 * @apiSuccess {String} data.name 城市名称.
 * @apiSuccess {String} data.city_id 城市id.
 * @apiSuccess {String} data.province_id 省份id.
 *
 * @apiSampleRequest /pcct/city
 */
router.get("/city", async (req, res) => {
    try {
        let { id } = req.query;
        let sql = 'SELECT * FROM city WHERE province_id = ?';
        let [results] = await pool.query(sql, [id]);
        //成功
        res.json({
            status: true,
            msg: "success!",
            data: results,
        });
    } catch (error) {
        res.json({
            status: false,
            msg: error.message,
            error,
        });
    }
});

/**
 * @api {get} /pcct/county 根据市区id获取县区
 * @apiName County
 * @apiGroup Province-City-County-Town
 * @apiPermission admin
 *
 * @apiUse Authorization
 *
 * @apiQuery {Number} id 市区id.
 *
 * @apiSuccess {Object[]} data 县区数组.
 * @apiSuccess {String} data._id 数据库id，无用处.
 * @apiSuccess {String} data.name 县区名称.
 * @apiSuccess {String} data.city_id 市区id.
 * @apiSuccess {String} data.county_id 县区id.
 *
 * @apiSampleRequest /pcct/county
 */
router.get("/county", async (req, res) => {
    try {
        let { id } = req.query;
        let sql = 'SELECT * FROM county WHERE city_id = ?';
        let [results] = await pool.query(sql, [id]);
        //成功
        res.json({
            status: true,
            msg: "success!",
            data: results,
        });
    } catch (error) {
        res.json({
            status: false,
            msg: error.message,
            error,
        });
    }
});

/**
 * @api {get} /pcct/town 根据县区id获取街道(镇)
 * @apiName Town
 * @apiGroup Province-City-County-Town
 * @apiPermission admin
 *
 * @apiUse Authorization
 *
 * @apiQuery {Number} id 县区id.
 *
 * @apiSuccess {Object[]} data 街道数组.
 * @apiSuccess {String} data._id 数据库id，无用处.
 * @apiSuccess {String} data.name 街道(镇)名称.
 * @apiSuccess {String} data.town_id 街道(镇)id.
 * @apiSuccess {String} data.county_id 县区id.
 *
 * @apiSampleRequest /pcct/town
 */
router.get("/town", async (req, res) => {
    try {
        let { id } = req.query;
        let sql = 'SELECT * FROM town WHERE county_id = ?';
        let [results] = await pool.query(sql, [id]);
        //成功
        res.json({
            status: true,
            msg: "success!",
            data: results,
        });
    } catch (error) {
        res.json({
            status: false,
            msg: error.message,
            error,
        });
    }
});

module.exports = router;

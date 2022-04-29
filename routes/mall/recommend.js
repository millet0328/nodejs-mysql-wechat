const express = require('express');
const router = express.Router();
// 数据库
let pool = require('../../config/mysql');
// 推荐系统
let ger = require('../../config/ger');

/**
 * @apiDefine Authorization
 * @apiHeader {String} Authorization 需在请求headers中设置Authorization: `Bearer ${token}`，小程序登录成功code换取的token。
 */

/**
 * @api {get} /recommend/user 根据账户行为推荐商品
 * @apiName RecommendForUser
 * @apiGroup Recommend
 * @apiPermission user
 *
 * @apiUse Authorization
 *
 * @apiSuccess {Number} id 商品id.
 * @apiSuccess {String} name 商品名称.
 * @apiSuccess {String} hotPoint 卖点.
 * @apiSuccess {Number} price 价格.
 * @apiSuccess {String} img_md 商品图片.
 *
 * @apiSampleRequest /recommend/user
 */
router.get("/user", async (req, res) => {
    let { openid } = req.user;
    let { pagesize = 10, pageindex = 1 } = req.query;
    // TODO 无法支持分页功能，需要修改底层依赖GER
    // 可能没有推荐商品，数组为空，如果数组为空，返回最新发布的商品
    let { recommendations } = await ger.recommendations_for_person('wechat-mall', openid, { actions: { likes: 2, watch: 1 } });
    let goods_id = recommendations.map((item) => item.thing);
    // 有可能没有任何推荐
    let select_sql = `SELECT id, name, price, img_md, hotPoint FROM goods`;
    if (recommendations.length > 0) {
        select_sql += ` WHERE id in (${goods_id})`;
    }
    // 查询商品信息
    let [goods] = await pool.query(select_sql, []);
    // 融合上面的数据
    let recommend_goods = recommendations.map((record) => {
        let results = goods.find((element) => element.id == record.thing)
        return { ...results, ...record }
    })
    // 获取成功
    res.json({
        status: true,
        msg: "获取成功!",
        data: recommend_goods,
    });
});

/**
 * @api {get} /recommend/goods 根据商品推荐相似商品
 * @apiName RecommendForGoods
 * @apiGroup Recommend
 * @apiPermission user
 *
 * @apiUse Authorization
 *
 * @apiQuery { Number } id 商品id.
 *
 * @apiSuccess {Number} id 商品id.
 * @apiSuccess {String} name 商品名称.
 * @apiSuccess {String} hotPoint 卖点.
 * @apiSuccess {Number} price 价格.
 * @apiSuccess {String} img_md 商品图片.
 *
 * @apiSampleRequest /recommend/goods
 */
router.get("/goods", async (req, res) => {
    let { pagesize = 10, pageindex = 1, id } = req.query;
    // TODO 无法支持分页功能，需要修改底层依赖GER
    // 计算推荐商品
    let { recommendations } = await ger.recommendations_for_thing('wechat-mall', id, { actions: { likes: 2, watch: 1 } });
    let goods_id = recommendations.map((item) => item.thing);
    // 可能没有推荐商品，数组为空，如果数组为空，返回最新发布的商品
    let select_sql = `SELECT id, name, price, img_md, hotPoint FROM goods`;
    if (recommendations.length > 0) {
        select_sql += ` WHERE id in (${goods_id})`;
    }
    select_sql += ` ORDER BY create_time DESC`
    // 查询商品信息
    let [goods] = await pool.query(select_sql, []);
    // 融合上面的数据
    let recommend_goods = recommendations.map((record) => {
        let results = goods.find((element) => element.id == record.thing)
        return { ...results, ...record }
    })
    // 获取成功
    res.json({
        status: true,
        msg: "获取成功!",
        data: recommend_goods,
    });
});

module.exports = router;
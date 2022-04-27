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
 * @api {get} /recommend 获取所有推荐的商品
 * @apiName RecommendList
 * @apiGroup Recommend
 * @apiPermission user
 *
 * @apiUse Authorization
 *
 * @apiQuery { Number } [pagesize=10] 每一页数量.
 * @apiQuery { Number } [pageindex=1] 第几页.
 *
 * @apiSuccess {Number} goods_id 商品id.
 * @apiSuccess {String} name 商品名称.
 * @apiSuccess {String} hotPoint 卖点.
 * @apiSuccess {Number} price 价格.
 * @apiSuccess {Number} marketPrice 市场价格.
 * @apiSuccess {String} img_md 商品图片.
 *
 * @apiSampleRequest /recommend
 */
router.get("/", async function (req, res) {
    let { openid } = req.user;
    let { pagesize = 10, pageindex = 1 } = req.query;
    //TODO 返回推荐商品数据
    let results = await ger.recommendations_for_person('wechat-mall', openid, { actions: { likes: 1 } });
    console.log(results)
    //成功
    res.json({
        status: true,
        msg: "获取成功!",
        data: results,
    });
});

module.exports = router;
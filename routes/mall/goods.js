const express = require('express');
const router = express.Router();
// 数据库
let pool = require('../../config/mysql');

/**
 * @apiDefine Authorization
 * @apiHeader {String} Authorization 需在请求headers中设置Authorization: `Bearer ${token}`，小程序登录成功code换取的token。
 */

/**
 * @api {get} /goods/list 获取商品列表--小程序
 * @apiDescription 具备搜索、分页功能，3个分类id参数至多能传1个，默认按照商品创建时间升序排序
 * @apiName GoodsList 获取商品列表
 * @apiGroup Goods
 * @apiPermission user
 *
 * @apiUse Authorization
 *
 * @apiQuery {Number} [pageSize=4] 一个页有多少个商品;
 * @apiQuery {Number} [pageIndex=1] 第几页;
 * @apiQuery {Number} [cate_id] 分类id。与cate_level同时传参
 * @apiQuery {Number = 1,2,3} [cate_level] 分类层级。与cate_id同时传参
 * @apiQuery {String} [keyword] 搜索关键词;
 * @apiQuery {String="ASC","DESC"} [sortByPrice] 按照价格排序，从小到大-ASC,从大到小-DESC;
 *
 * @apiSuccess {Object[]} goods 商品数组.
 * @apiSuccess {Number} total 商品总数.
 *
 * @apiSampleRequest /goods/list
 */

router.get("/list", async (req, res) => {
    try {
        let { pageSize = 4, pageIndex = 1, cate_id, cate_level, keyword, sortByPrice } = req.query;
        // 计算偏移量
        let pagesize = parseInt(pageSize);
        let offset = pagesize * (pageIndex - 1);
        // 根据参数，拼接SQL
        let select_sql = `SELECT SQL_CALC_FOUND_ROWS id, name, price, img_md, hotPoint FROM GOODS WHERE 1 = 1`
        let cate = [null, 'cate_1st', 'cate_2nd', 'cate_3rd'];
        if (cate_level) {
            let cate_name = cate[cate_level];
            select_sql += ` AND ${cate_name} = ${cate_id}`;
        }
        if (keyword) {
            select_sql += ` AND name LIKE '%${keyword}%'`;
        }
        if (sortByPrice) {
            select_sql += ` ORDER BY price ${sortByPrice}`;
        } else {
            select_sql += ` ORDER BY create_time DESC`;
        }
        select_sql += ` LIMIT ? OFFSET ?;SELECT FOUND_ROWS() as total;`
        // 查询商品
        let [results] = await pool.query(select_sql, [pagesize, offset]);

        res.json({
            status: true,
            msg: "获取成功!",
            data: results[0],
            ...results[1][0],
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
 * @api {get} /goods/detail 获取商品详情--小程序
 * @apiName GoodsDetail
 * @apiGroup Goods
 * @apiPermission user
 *
 * @apiUse Authorization
 *
 * @apiQuery {Number} id 商品id;
 *
 * @apiSampleRequest /goods/detail
 */
router.get("/detail", async (req, res) => {
    try {
        let { id } = req.query;
        let { openid } = req.user;
        // 查询商品
        let goods_sql = 'SELECT id, name, price, hotPoint, marketPrice, discount, img_md, slider, detail FROM GOODS WHERE id = ?';
        let [[goods]] = await pool.query(goods_sql, [id]);
        // 查询收藏
        let collection_sql = `SELECT * FROM collection WHERE goods_id = ? AND uid = ?`;
        let [results] = await pool.query(collection_sql, [id, openid]);
        // 判断是否已收藏
        if (results[0].length > 0) {
            goods.isCollected = true;
        } else {
            goods.isCollected = false;
        }
        //成功
        res.json({
            status: true,
            msg: "获取成功!",
            data: goods
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

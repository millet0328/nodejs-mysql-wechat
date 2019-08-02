const express = require('express');
const router = express.Router();
// 数据库
let db = require('../../config/mysql');

/**
 * @api {get} /api/goods/list 获取商品列表
 * @apiDescription 具备商品分页功能，3个分类参数至多能传1个
 * @apiName GoodsList 获取商品列表
 * @apiGroup Goods
 *
 * @apiParam {Number} [pageSize] 一个页有多少个商品,默认4个;
 * @apiParam {Number} [pageIndex] 第几页,默认1;
 * @apiParam {Number} [cate_1st] 一级分类id;
 * @apiParam {Number} [cate_2nd] 二级分类id;
 * @apiParam {Number} [cate_3rd] 三级分类id;
 * @apiParam {String="ASC","DESC"} [sortByPrice] 按照价格排序，从小到大-ASC,从大到小-DESC;
 * @apiSampleRequest /api/goods/list
 */
router.get("/list", function(req, res) {
    let query = req.query;
    //取出空键值对
    for (let key in query) {
        if (!query[key]) {
            delete query[key]
        }
    }
    //拼接SQL
    function produceSQL({ pageSize = 4, pageIndex = 1, sortByPrice = '', cate_1st = '', cate_2nd = '', cate_3rd = '', }) {
        let size = parseInt(pageSize);
        let count = size * (pageIndex - 1);
        let sql = `SELECT id,name,price,hotPoint,marketPrice,discount,img_md FROM GOODS `
        if (cate_1st) {
            sql += `WHERE cate_1st = ${cate_1st}`;
        }
        if (cate_2nd) {
            sql += `WHERE cate_2nd = ${cate_2nd}`;
        }
        if (cate_3rd) {
            sql += `WHERE cate_3rd = ${cate_3rd}`;
        }
        sql += ` ORDER BY price ${sortByPrice},create_time DESC LIMIT ${count},${size}`
        return sql;
    }
    db.query(produceSQL(req.query), [], function(results, fields) {
        //成功
        res.json({
            status: true,
            msg: "success!",
            data: results
        });
    });
});
/**
 * @api {get} /api/goods/detail 获取商品详情
 * @apiName GoodsDetail
 * @apiGroup Goods
 *
 * @apiParam {Number} id 商品id;
 *
 * @apiSampleRequest /api/goods/detail
 */
router.get("/detail", function(req, res) {
    let sql = `SELECT id,name,price,hotPoint,marketPrice,discount,slider,detail FROM GOODS WHERE id = ?`
    db.query(sql, [req.query.id], function(results, fields) {
        //成功
        res.json({
            status: true,
            msg: "success!",
            data: results[0]
        });
    });
});

module.exports = router;
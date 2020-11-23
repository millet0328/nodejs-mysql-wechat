const express = require('express');
const router = express.Router();
// 数据库
let db = require('../../config/mysql');

/**
 * @api {get} /api/goods/list 获取商品列表
 * @apiDescription 具备商品分页功能，3个分类id参数至多能传1个，默认按照商品创建时间升序排序
 * @apiName GoodsList 获取商品列表
 * @apiGroup Goods
 * @apiPermission user
 *
 * @apiParam {Number} [pageSize=4] 一个页有多少个商品;
 * @apiParam {Number} [pageIndex=1] 第几页;
 * @apiParam {Number} [cate_1st] 一级分类id;
 * @apiParam {Number} [cate_2nd] 二级分类id;
 * @apiParam {Number} [cate_3rd] 三级分类id;
 * @apiParam {String="ASC","DESC"} [sortByPrice] 按照价格排序，从小到大-ASC,从大到小-DESC;
 *
 * @apiSuccess {Object[]} goods 商品数组.
 * @apiSuccess {Number} total 商品总数.
 *
 * @apiSampleRequest /api/goods/list
 */
router.get("/list", function (req, res) {
    let { pageSize = 4, pageIndex = 1, cate_1st, cate_2nd, cate_3rd, sortByPrice } = req.query;
    //拼接SQL
    let size = parseInt(pageSize);
    let count = size * (pageIndex - 1);
    let sql =
        `SELECT SQL_CALC_FOUND_ROWS id,name,price,img_md,articleNo,inventory,DATE_FORMAT(create_time,'%Y-%m-%d %H:%i:%s') AS create_time FROM GOODS`
    if (cate_1st) {
        sql += ` WHERE cate_1st = ${cate_1st}`;
    }
    if (cate_2nd) {
        sql += ` WHERE cate_2nd = ${cate_2nd}`;
    }
    if (cate_3rd) {
        sql += ` WHERE cate_3rd = ${cate_3rd}`;
    }
    if (sortByPrice) {
        sql += ` ORDER BY price ${sortByPrice}`;
    } else {
        sql += ` ORDER BY create_time DESC`;
    }
    sql += ` LIMIT ${count},${size};SELECT FOUND_ROWS() as total;`

    db.query(sql, [], function (results) {
        //成功
        res.json({
            status: true,
            msg: "success!",
            goods: results[0],
            ...results[1][0],
        });
    });
});
/**
 * @api {get} /api/goods/detail 获取商品详情
 * @apiName GoodsDetail
 * @apiGroup Goods
 * @apiPermission user
 *
 * @apiParam {Number} id 商品id;
 *
 * @apiSampleRequest /api/goods/detail
 */
router.get("/detail", function (req, res) {
    let { id } = req.query;
    let { openid } = req.user;
    let sql = `
	SELECT id, name, price, hotPoint, marketPrice, discount, img_md, slider, detail FROM GOODS WHERE id = ?;
	SELECT * FROM collection WHERE goods_id = ? AND uid = ?;
	`
    db.query(sql, [id, id, openid], function (results) {
        if (results[1].length) {
            results[0][0].isCollected = true;
        } else {
            results[0][0].isCollected = false;
        }
        //成功
        res.json({
            status: true,
            msg: "success!",
            data: results[0][0]
        });
    });
});

module.exports = router;

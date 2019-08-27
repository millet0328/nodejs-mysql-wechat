const express = require('express');
const router = express.Router();
// 数据库
let db = require('../../config/mysql');

/**
 * @api {post} /api/admin/goods 发布新商品
 * @apiName goods/release/
 * @apiGroup admin Goods
 * @apiPermission admin
 *
 * @apiParam {Number} cate_1st 一级分类id;
 * @apiParam {Number} cate_2nd 二级分类id;
 * @apiParam {Number} [cate_3rd] 三级分类id;
 * @apiParam {String} name 商品名称;
 * @apiParam {String} [hotPoint] 商品热点描述;
 * @apiParam {Number} price 商品价格;
 * @apiParam {Number} marketPrice 市场价;
 * @apiParam {Number} cost 成本价;
 * @apiParam {Number} discount 折扣如：75%;
 * @apiParam {Number} inventory 商品库存;
 * @apiParam {String} articleNo 商品货号;
 * @apiParam {String} img_lg 商品主图-720;
 * @apiParam {String} img_md 商品主图-360;
 * @apiParam {String} slider 商品轮播图片，例：slider:'src1,src2,src3';
 * @apiParam {String} [brand] 商品品牌;
 * @apiParam {String} detail 商品详情,一般存储为HTML代码;
 * @apiParam {Number} freight 商品运费;
 *
 * @apiSampleRequest /api/admin/goods/release
 */
router.post("/", function (req, res) {
    let {cate_1st, cate_2nd, cate_3rd, name, hotPoint, price, marketPrice, cost, discount, inventory, articleNo, img_lg, img_md, slider, brand, detail, freight} = req.body;
    let sql =
        `INSERT INTO GOODS (cate_1st,cate_2nd,cate_3rd,name,hotPoint,price,marketPrice,cost,discount,inventory,articleNo,img_lg,img_md,slider,brand,detail,freight,create_time) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP()) `;
    db.query(sql, [cate_1st, cate_2nd, cate_3rd, name, hotPoint, price, marketPrice, cost, discount, inventory, articleNo, img_lg, img_md, slider, brand, detail, freight], function (results, fields) {
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
 * @api {put} /api/admin/goods 编辑商品
 * @apiName goodsEdit
 * @apiGroup admin Goods
 * @apiPermission admin
 *
 * @apiParam {Number} id 商品id;
 * @apiParam {Number} cate_1st 一级分类id;
 * @apiParam {Number} cate_2nd 二级分类id;
 * @apiParam {Number} [cate_3rd] 三级分类id;
 * @apiParam {String} name 商品名称;
 * @apiParam {String} [hotPoint] 商品热点描述;
 * @apiParam {Number} price 商品价格;
 * @apiParam {Number} marketPrice 市场价;
 * @apiParam {Number} cost 成本价;
 * @apiParam {Number} discount 折扣如：75%;
 * @apiParam {Number} inventory 商品库存;
 * @apiParam {String} articleNo 商品货号;
 * @apiParam {String} img_lg 商品主图-720;
 * @apiParam {String} img_md 商品主图-360;
 * @apiParam {String} slider 商品轮播图片，例：slider:'src1,src2,src3';
 * @apiParam {String} [brand] 商品品牌;
 * @apiParam {String} detail 商品详情,一般存储为HTML代码;
 * @apiParam {Number} freight 商品运费;
 *
 * @apiSampleRequest /api/admin/goods
 */
router.put("/", function (req, res) {
    let {id, cate_1st, cate_2nd, cate_3rd, name, hotPoint, price, marketPrice, cost, discount, inventory, articleNo, img_lg, img_md, slider, brand, detail, freight} = req.body;
    let sql =
        `UPDATE GOODS SET cate_1st=?,cate_2nd=?,cate_3rd=?,name=?,hotPoint=?,price=?,marketPrice=?,cost=?,discount=?,inventory=?,articleNo=?,img_lg=?,img_md=?,slider=?,brand=?,detail=?,freight=?,update_time = CURRENT_TIMESTAMP() WHERE id=?`;
    db.query(sql, [cate_1st, cate_2nd, cate_3rd, name, hotPoint, price, marketPrice, cost, discount, inventory, articleNo, img_lg, img_md, slider, brand, detail, freight, id], function (results, fields) {
        //成功
        res.json({
            status: true,
            msg: "success!",
            data: results[0]
        });
    });
});
/**
 * @api {get} /api/admin/goods/list 获取商品列表
 * @apiDescription 具备商品分页功能，3个分类参数至多能传1个
 * @apiName AdminGoodsList
 * @apiGroup admin Goods
 * @apiPermission admin
 *
 * @apiParam {Number} [pageSize] 一个页有多少个商品,默认4个;
 * @apiParam {Number} [pageIndex] 第几页,默认1;
 * @apiParam {Number} [cate_1st] 一级分类id;
 * @apiParam {Number} [cate_2nd] 二级分类id;
 * @apiParam {Number} [cate_3rd] 三级分类id;
 * @apiParam {String="ASC","DESC"} [sortByPrice] 按照价格排序，从小到大-ASC,从大到小-DESC;
 * @apiSampleRequest /api/admin/goods/list
 */
router.get("/list", function (req, res) {
    let query = req.query;
    //取出空键值对
    for (let key in query) {
        if (!query[key]) {
            delete query[key]
        }
    }

    //拼接SQL
    function produceSQL({pageSize = 4, pageIndex = 1, sortByPrice = '', cate_1st = '', cate_2nd = '', cate_3rd = '',}) {
        let size = parseInt(pageSize);
        let count = size * (pageIndex - 1);
        let sql = `SELECT id,name,price,img_md,articleNo,inventory,create_time FROM GOODS`
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

    db.query(produceSQL(req.query), [], function (results, fields) {
        //成功
        res.json({
            status: true,
            msg: "success!",
            data: results
        });
    });
});
/**
 * @api {get} /api/admin/goods 获取商品详情
 * @apiName GoodsDetail
 * @apiGroup admin Goods
 *
 * @apiParam {Number} id 商品id;
 *
 * @apiSampleRequest /api/admin/goods
 */
router.get("/", function (req, res) {
    let {id} = req.query;
    let sql = `SELECT * FROM GOODS WHERE id = ?`;
    db.query(sql, [id], function (results, fields) {
        //成功
        res.json({
            status: true,
            msg: "success!",
            data: results[0]
        });
    });
});
/**
 * @api {delete} /api/admin/goods 删除商品
 * @apiName GoodsDelete
 * @apiGroup admin Goods
 * @apiPermission admin
 *
 * @apiParam {Number} id 商品id;
 *
 * @apiSampleRequest /api/admin/goods
 */
router.delete("/", function (req, res) {
    let {id} = req.query;
    let sql = `DELETE FROM GOODS WHERE id=?`;
    db.query(sql, [id], function (results, fields) {
        //成功
        res.json({
            status: true,
            msg: "success!",
        });
    });
});
module.exports = router;
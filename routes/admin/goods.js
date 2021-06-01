const express = require('express');
const router = express.Router();
// 数据库
let db = require('../../config/mysql');

/**
 * @api {post} /api/admin/goods 发布新商品
 * @apiName goodsRelease
 * @apiGroup admin Goods
 * @apiPermission admin
 *
 * @apiParam {Number} cate_1st 一级分类id;
 * @apiParam {Number} cate_2nd 二级分类id;
 * @apiParam {Number} cate_3rd 三级分类id，无此分类，id = 0;
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
router.post("/", function (req, res) {
    let { cate_1st, cate_2nd, cate_3rd = 0, name, hotPoint, price, marketPrice, cost, discount, inventory, articleNo, img_lg, img_md, slider, brand, detail, freight } = req.body;
    let sql =
        `INSERT INTO GOODS (cate_1st,cate_2nd,cate_3rd,name,hotPoint,price,marketPrice,cost,discount,inventory,articleNo,img_lg,img_md,slider,brand,detail,freight,create_time) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP()) `;
    db.query(sql, [cate_1st, cate_2nd, cate_3rd, name, hotPoint, price, marketPrice, cost, discount, inventory,
        articleNo, img_lg, img_md, slider, brand, detail, freight
    ], function (results) {
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
    let { id, cate_1st, cate_2nd, cate_3rd = 0, name, hotPoint, price, marketPrice, cost, discount, inventory, articleNo, img_lg, img_md, slider, brand, detail, freight } = req.body;
    console.log(cate_3rd);
    let sql =
        `UPDATE GOODS SET cate_1st=?,cate_2nd=?,cate_3rd=?,name=?,hotPoint=?,price=?,marketPrice=?,cost=?,discount=?,inventory=?,articleNo=?,img_lg=?,img_md=?,slider=?,brand=?,detail=?,freight=?,update_time = CURRENT_TIMESTAMP() WHERE id=?`;
    db.query(sql, [cate_1st, cate_2nd, cate_3rd, name, hotPoint, price, marketPrice, cost, discount, inventory,
        articleNo, img_lg, img_md, slider, brand, detail, freight, id
    ], function (results) {
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
 * @apiDescription 具备搜索、分页功能，3个分类id参数至多能传1个，默认按照商品创建时间升序排序
 * @apiName AdminGoodsList
 * @apiGroup admin Goods
 * @apiPermission admin
 *
 * @apiParam {Number} [pageSize=4] 一个页有多少个商品;
 * @apiParam {Number} [pageIndex=1] 第几页;
 * @apiParam {Number} [cate_1st] 一级分类id;
 * @apiParam {Number} [cate_2nd] 二级分类id;
 * @apiParam {Number} [cate_3rd] 三级分类id;
 * @apiParam {String} [keyword] 搜索关键词;
 * @apiParam {String="ASC","DESC"} [sortByPrice] 按照价格排序，从小到大-ASC,从大到小-DESC;
 *
 * @apiSuccess {Object[]} goods 商品数组.
 * @apiSuccess {Number} total 商品总数.
 *
 * @apiSampleRequest /api/admin/goods/list
 */
router.get("/list", function (req, res) {
    let { pageSize = 4, pageIndex = 1, cate_1st, cate_2nd, cate_3rd, keyword, sortByPrice } = req.query;
    //拼接SQL
    let size = parseInt(pageSize);
    let count = size * ( pageIndex - 1 );
    let sql =
        `SELECT SQL_CALC_FOUND_ROWS *, DATE_FORMAT(create_time,'%Y-%m-%d %H:%i:%s') AS create_time FROM GOODS WHERE 1 = 1`
    if (cate_1st) {
        sql += ` AND cate_1st = ${ cate_1st }`;
    }
    if (cate_2nd) {
        sql += ` AND cate_2nd = ${ cate_2nd }`;
    }
    if (cate_3rd) {
        sql += ` AND cate_3rd = ${ cate_3rd }`;
    }
    if (keyword) {
        sql += ` AND name LIKE '%${ keyword }%'`;
    }
    if (sortByPrice) {
        sql += ` ORDER BY price ${ sortByPrice }`;
    } else {
        sql += ` ORDER BY create_time DESC`;
    }
    sql += ` LIMIT ${ count },${ size };SELECT FOUND_ROWS() as total;`

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
 * @api {get} /api/admin/goods 获取商品详情
 * @apiName GoodsDetail
 * @apiGroup admin Goods
 * @apiPermission admin
 *
 * @apiParam {Number} id 商品id;
 *
 * @apiSampleRequest /api/admin/goods
 */
router.get("/", function (req, res) {
    let { id } = req.query;
    let sql = `SELECT * FROM GOODS WHERE id = ?`;
    db.query(sql, [id], function (results) {
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
    let { id } = req.query;
    let sql = `DELETE FROM GOODS WHERE id=?`;
    db.query(sql, [id], function (results) {
        //成功
        res.json({
            status: true,
            msg: "success!",
        });
    });
});
module.exports = router;

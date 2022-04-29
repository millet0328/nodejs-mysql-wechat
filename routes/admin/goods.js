const express = require('express');
const router = express.Router();
// 数据库
let pool = require('../../config/mysql');

/**
 * @api {post} /seller/goods 发布新商品
 * @apiName goodsRelease
 * @apiGroup Goods
 * @apiPermission admin
 *
 * @apiUse Authorization
 *
 * @apiBody {Number} cate_1st 一级分类id;
 * @apiBody {Number} cate_2nd 二级分类id;
 * @apiBody {Number} [cate_3rd=0] 三级分类id，无此分类，id = 0;
 * @apiBody {String} name 商品名称;
 * @apiBody {String} [hotPoint] 商品热点描述;
 * @apiBody {Number} price 商品价格;
 * @apiBody {Number} marketPrice 市场价;
 * @apiBody {Number} cost 成本价;
 * @apiBody {Number} discount 折扣如：75%;
 * @apiBody {Number} inventory 商品库存;
 * @apiBody {String} articleNo 商品货号;
 * @apiBody {String} img_lg 商品主图-720;
 * @apiBody {String} img_md 商品主图-360;
 * @apiBody {String} slider 商品轮播图片，例：slider:'src1,src2,src3';
 * @apiBody {String} [brand] 商品品牌;
 * @apiBody {String} detail 商品详情,一般存储为HTML代码;
 * @apiBody {Number} freight 商品运费;
 *
 * @apiSampleRequest /seller/goods
 */

router.post("/", async function (req, res) {
    let { cate_1st, cate_2nd, cate_3rd = 0, name, hotPoint, price, marketPrice, cost, discount, inventory, articleNo, img_lg, img_md, slider, brand, detail, freight } = req.body;
    let sql = `INSERT INTO GOODS (cate_1st,cate_2nd,cate_3rd,name,hotPoint,price,marketPrice,cost,discount,inventory,articleNo,img_lg,img_md,slider,brand,detail,freight,create_time) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP())`;
    let [{ insertId, affectedRows }] = await pool.query(sql, [cate_1st, cate_2nd, cate_3rd, name, hotPoint, price, marketPrice, cost, discount, inventory, articleNo, img_lg, img_md, slider, brand, detail, freight]);
    // 创建失败
    if (affectedRows === 0) {
        res.json({
            status: false,
            msg: "发布商品失败！"
        });
        return;
    }
    // 创建成功
    res.json({
        status: true,
        msg: "发布商品成功!",
        data: { id: insertId }
    });
});
/**
 * @api {put} /seller/goods/:id 编辑商品
 * @apiName goodsEdit
 * @apiGroup Goods
 * @apiPermission admin
 *
 * @apiUse Authorization
 *
 * @apiParam {Number} id 商品id;
 * @apiBody {Number} cate_1st 一级分类id;
 * @apiBody {Number} cate_2nd 二级分类id;
 * @apiBody {Number} [cate_3rd] 三级分类id;
 * @apiBody {String} name 商品名称;
 * @apiBody {String} [hotPoint] 商品热点描述;
 * @apiBody {Number} price 商品价格;
 * @apiBody {Number} marketPrice 市场价;
 * @apiBody {Number} cost 成本价;
 * @apiBody {Number} discount 折扣如：75%;
 * @apiBody {Number} inventory 商品库存;
 * @apiBody {String} articleNo 商品货号;
 * @apiBody {String} img_lg 商品主图-720;
 * @apiBody {String} img_md 商品主图-360;
 * @apiBody {String} slider 商品轮播图片，例：slider:'src1,src2,src3';
 * @apiBody {String} [brand] 商品品牌;
 * @apiBody {String} detail 商品详情,一般存储为HTML代码;
 * @apiBody {Number} freight 商品运费;
 *
 * @apiExample {js} 参数示例:
 * /seller/goods/3
 *
 * @apiSampleRequest /seller/goods
 */
router.put("/:id", async function (req, res) {
    let { id } = req.params;
    let { cate_1st, cate_2nd, cate_3rd = 0, name, hotPoint, price, marketPrice, cost, discount, inventory, articleNo, img_lg, img_md, slider, brand, detail, freight } = req.body;
    let sql = `UPDATE GOODS SET cate_1st = ?,cate_2nd = ?,cate_3rd = ?,name = ?,hotPoint = ?,price = ?,marketPrice = ?,cost = ?,discount = ?,inventory = ?,articleNo = ?,img_lg = ?,img_md = ?,slider = ?,brand = ?,detail = ?,freight = ?,update_time = CURRENT_TIMESTAMP() WHERE id = ?`;
    let [{ affectedRows }] = await pool.query(sql, [cate_1st, cate_2nd, cate_3rd, name, hotPoint, price, marketPrice, cost, discount, inventory, articleNo, img_lg, img_md, slider, brand, detail, freight, id]);
    // 修改失败
    if (affectedRows === 0) {
        res.json({
            status: false,
            msg: "修改失败！"
        });
        return;
    }
    // 修改成功
    res.json({
        status: true,
        msg: "修改成功!",
    });
});
/**
 * @api {get} /seller/goods/list 获取商品列表--后台管理系统
 * @apiDescription 具备搜索、分页功能，3个分类id参数至多能传1个，默认按照商品创建时间升序排序
 * @apiName AdminGoodsList
 * @apiGroup Goods
 * @apiPermission admin
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
 * @apiSampleRequest /seller/goods/list
 */
router.get("/list", async function (req, res) {
    let { pageSize = 4, pageIndex = 1, cate_id, cate_level, keyword, sortByPrice } = req.query;
    // 计算偏移量
    let pagesize = parseInt(pageSize);
    let offset = pagesize * (pageIndex - 1);
    // TODO 约束返回字段，增加分类字段
    // 根据参数，拼接SQL
    let select_sql = `SELECT *, DATE_FORMAT(create_time,'%Y-%m-%d %H:%i:%s') AS create_time FROM GOODS WHERE 1 = 1`
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
    select_sql += ` LIMIT ? OFFSET ?`;
    // 查询商品信息
    let [goods] = await pool.query(select_sql, [pagesize, offset]);
    // 计算总数
    let total_sql = `SELECT COUNT(*) as total FROM GOODS`;
    let [total] = await pool.query(total_sql, []);

    res.json({
        status: true,
        msg: "success!",
        data: goods,
        ...total[0],
    });
});
/**
 * @api {get} /seller/goods 获取商品详情--后台管理系统
 * @apiName AdminGoodsDetail
 * @apiGroup Goods
 * @apiPermission admin
 *
 * @apiUse Authorization
 *
 * @apiQuery {Number} id 商品id;
 *
 * @apiSampleRequest /seller/goods
 */
router.get("/", async function (req, res) {
    let { id } = req.query;
    let sql = `SELECT * FROM GOODS WHERE id = ?`;
    let [results] = await pool.query(sql, [id]);
    // 获取成功
    res.json({
        status: true,
        msg: "获取成功!",
        data: results[0]
    });
});
/**
 * @api {delete} /seller/goods/:id 删除商品
 * @apiName GoodsDelete
 * @apiGroup Goods
 * @apiPermission admin
 *
 * @apiUse Authorization
 *
 * @apiParam {Number} id 商品id;
 *
 * @apiExample {js} 参数示例:
 * /seller/goods/3
 *
 * @apiSampleRequest /seller/goods
 */
router.delete("/:id", async function (req, res) {
    let { id } = req.params;
    let sql = `DELETE FROM GOODS WHERE id=?`;
    let [{ affectedRows }] = await pool.query(sql, [id]);
    // 删除失败
    if (affectedRows === 0) {
        res.json({
            status: false,
            msg: "删除失败！"
        });
        return;
    }
    // 删除成功
    res.json({
        status: true,
        msg: "删除成功!"
    });
});
module.exports = router;

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
 * @api {post} /collection 添加商品至我的收藏
 * @apiName CollectionAdd
 * @apiGroup Collection
 * @apiPermission user
 *
 * @apiUse Authorization
 *
 * @apiBody {Number} id 商品id.
 *
 * @apiSampleRequest /collection
 */

router.post("/", async function (req, res) {
    let { id } = req.body;
    let { openid } = req.user;
    // 判断是否已收藏
    let select_sql = 'SELECT * FROM collection WHERE goods_id = ? AND uid = ?';
    let [results] = await pool.query(select_sql, [id, openid]);
    if (results.length > 0) {
        res.json({
            status: false,
            msg: "已收藏此商品!"
        });
        return;
    }
    let insert_sql = 'INSERT INTO collection ( uid, goods_id ) VALUES (?,?)';
    let [{ affectedRows }] = await pool.query(insert_sql, [openid, id]);
    if (affectedRows === 0) {
        res.json({
            status: false,
            msg: "收藏失败!"
        });
        return;
    }
    // 添加浏览事件
    await ger.events([{ namespace: 'wechat-mall', person: openid, action: 'likes', thing: id, expires_at: ger.expires_date }]);

    res.json({
        status: true,
        msg: "收藏成功!"
    });
});

/**
 * @api {delete} /collection/:id 取消收藏的商品
 * @apiName CollectionRemove
 * @apiGroup Collection
 * @apiPermission user
 *
 * @apiUse Authorization
 *
 * @apiParam {Number} id 商品id.
 *
 * @apiSampleRequest /collection
 */
router.delete("/:id", async function (req, res) {
    let { id } = req.params;
    let { openid } = req.user;
    let sql = 'DELETE FROM collection WHERE goods_id = ? and uid = ?';
    let [{ affectedRows }] = await pool.query(sql, [id, openid]);
    // 删除失败
    if (affectedRows === 0) {
        res.json({
            status: false,
            msg: "取消收藏失败!",
        });
        return;
    }
    // 删除成功
    res.json({
        status: true,
        msg: "取消收藏成功!",
    });
});

/**
 * @api {get} /collection 获取所有收藏的商品
 * @apiName CollectionList
 * @apiGroup Collection
 * @apiPermission user
 *
 * @apiUse Authorization
 *
 * @apiQuery { Number } [pagesize=10] 每一页数量.
 * @apiQuery { Number } [pageindex=1] 第几页.
 *
 * @apiSuccess {Number} id 收藏条目id.
 * @apiSuccess {Number} goods_id 商品id.
 * @apiSuccess {String} name 商品名称.
 * @apiSuccess {String} hotPoint 卖点.
 * @apiSuccess {Number} price 价格.
 * @apiSuccess {Number} marketPrice 市场价格.
 * @apiSuccess {String} img_md 商品图片.
 *
 * @apiSampleRequest /collection
 */
router.get("/", async function (req, res) {
    let { openid } = req.user;
    let { pagesize = 10, pageindex = 1 } = req.query;
    // 计算偏移量
    pagesize = parseInt(pagesize);
    const offset = pagesize * (pageindex - 1);

    let select_sql = 'SELECT c.id, c.goods_id, g.name, g.hotPoint, g.price, g.marketPrice, g.img_md FROM collection c JOIN goods g ON c.goods_id = g.id WHERE uid = ? LIMIT ? OFFSET ?';
    let [collections] = await pool.query(select_sql, [openid, pagesize, offset]);
    // 计算总数
    let total_sql = `SELECT COUNT(*) as total FROM collection WHERE uid = ?`;
    let [total] = await pool.query(total_sql, [openid]);
    //成功
    res.json({
        status: true,
        msg: "获取成功!",
        data: collections,
        ...total[0],
    });
});

module.exports = router;

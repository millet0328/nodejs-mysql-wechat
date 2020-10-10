const express = require('express');
const router = express.Router();
// 数据库
let db = require('../../config/mysql');

/**
 * @api {post} /api/collection 添加商品至我的收藏
 * @apiName CollectionAdd
 * @apiGroup Collection
 * @apiPermission user
 *
 * @apiParam {Number} id 商品id.
 *
 * @apiSampleRequest /api/collection
 */
router.post("/", function (req, res) {
    let { id } = req.body;
    let { openid } = req.user;
    let sql = 'INSERT INTO collection ( uid, goods_id ) VALUES (?,?)';
    db.query(sql, [openid, id], function (results) {
        //成功
        res.json({
            status: true,
            msg: "success!",
        });
    });
});

/**
 * @api {delete} /api/collection/:id 取消收藏的商品
 * @apiName CollectionRemove
 * @apiGroup Collection
 * @apiPermission user
 *
 * @apiParam {Number} id 商品id.
 *
 * @apiSampleRequest /api/collection
 */
router.delete("/:id", function (req, res) {
    let { id } = req.params;
    let { openid } = req.user;
    let sql = 'DELETE FROM collection WHERE goods_id = ? and uid = ?';
    db.query(sql, [id, openid], function (results) {
        //成功
        res.json({
            status: true,
            msg: "success!",
        });
    });
});

/**
 * @api {get} /api/collection 获取所有收藏的商品
 * @apiName CollectionList
 * @apiGroup Collection
 * @apiPermission user
 *
 * @apiSuccess {Number} id 收藏条目id.
 * @apiSuccess {Number} goods_id 商品id.
 * @apiSuccess {String} name 商品名称.
 * @apiSuccess {String} hotPoint 卖点.
 * @apiSuccess {Number} price 价格.
 * @apiSuccess {Number} marketPrice 市场价格.
 * @apiSuccess {String} img_md 商品图片.
 *
 * @apiSampleRequest /api/collection
 */
router.get("/", function (req, res) {
    let { openid } = req.user;
    let sql = 'SELECT c.id, c.goods_id, g.name, g.hotPoint, g.price, g.marketPrice, g.img_md FROM collection c JOIN goods g ON c.goods_id = g.id WHERE uid = ?';
    db.query(sql, [openid], function (results) {
        //成功
        res.json({
            status: true,
            msg: "success!",
            data: results,
        });
    });
});

module.exports = router;

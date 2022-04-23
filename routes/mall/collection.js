const express = require('express');
const router = express.Router();
// 数据库
let pool = require('../../config/mysql');

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
router.post("/", async (req, res) => {
    try {
        let { id } = req.body;
        let { openid } = req.user;
        let sql = 'INSERT INTO collection ( uid, goods_id ) VALUES (?,?)';
        let [{ affectedRows }] = await pool.query(sql, [openid, id]);
        if (affectedRows === 0) {
            res.json({
                status: false,
                msg: "添加失败!"
            });
            return;
        }
        res.json({
            status: true,
            msg: "添加成功!"
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
router.delete("/:id", async (req, res) => {
    try {
        let { id } = req.params;
        let { openid } = req.user;
        let sql = 'DELETE FROM collection WHERE goods_id = ? and uid = ?';
        let [{ affectedRows }] = await pool.query(sql, [id, openid]);
        // 删除失败
        if (affectedRows === 0) {
            res.json({
                status: false,
                msg: "删除失败!",
            });
            return;
        }
        // 删除成功
        res.json({
            status: true,
            msg: "删除成功!",
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
router.get("/", async (req, res) => {
    try {
        let { openid } = req.user;
        let { pagesize = 10, pageindex = 1 } = req.query;
        // 计算偏移量
        pagesize = parseInt(pagesize);
        const offset = pagesize * (pageindex - 1);
        let sql = 'SELECT SQL_CALC_FOUND_ROWS c.id, c.goods_id, g.name, g.hotPoint, g.price, g.marketPrice, g.img_md FROM collection c JOIN goods g ON c.goods_id = g.id WHERE uid = ? LIMIT ? OFFSET ?; SELECT FOUND_ROWS() as total;';
        let [results] = await pool.query(sql, [openid, pagesize, offset]);
        //成功
        res.json({
            status: true,
            msg: "获取成功!",
            ...results[1][0],
            data: results[0],
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

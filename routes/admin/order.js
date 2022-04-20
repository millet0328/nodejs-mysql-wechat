const express = require('express');
const router = express.Router();
// 数据库
let pool = require('../../config/mysql');

/**
 * @api {get} /admin/order/list 获取所有账户订单列表
 * @apiDescription 获取系统中的订单列表，根据订单状态获取列表，具备分页功能
 * @apiName AdminOrderList
 * @apiGroup Order
 * @apiPermission admin
 *
 * @apiQuery {Number} [pageSize=4] 一个页有多少个商品,默认4个;
 * @apiQuery {Number} [pageIndex=1] 第几页,默认1;
 * @apiQuery {Number=0,3,4,5,all} status 订单状态:0-待付款，3-待发货，4-待收货，5-待评价，all-所有状态;
 *
 * @apiSampleRequest /admin/order/list
 */

router.get('/list', async function (req, res) {
    let { pageSize = 4, pageIndex = 1, status = 'all' } = req.query;
    // 计算偏移量
    let size = parseInt(pageSize);
    let offset = size * (pageIndex - 1);
    // 查询所有订单
    let order_sql = `SELECT o.id, o.create_time, o.payment, os.text AS status FROM orders o JOIN order_status os ON o.order_state = os.CODE ORDER BY o.create_time DESC LIMIT ? OFFSET ?`;
    // 根据订单状态查询
    if (status !== 'all') {
        order_sql = `SELECT o.id, o.create_time, o.payment, os.text AS status FROM orders o JOIN order_status os ON o.order_state = os.CODE WHERE o.order_state = ${status} ORDER BY o.create_time DESC LIMIT ? OFFSET ?`;
    }
    let [orders] = await pool.query(order_sql, [size, offset]);

    // 查询订单商品信息
    let goods_sql = `SELECT g.id, g.name, g.img_md, og.goods_num, og.goods_price, og.order_id FROM orders o JOIN order_goods og ON o.id = og.order_id JOIN goods g ON g.id = og.goods_id`;
    if (status !== 'all') {
        goods_sql += ` WHERE o.order_state = ${status}`;
    }
    let [goods] = await pool.query(goods_sql, []);
    // 遍历订单，添加其包含的商品信息，隐藏bug：goods结果可能非常大，可能仅有几条商品被添加。
    // 解决方案：根据订单id，逐一查询订单包含的商品，隐藏bug：sql查询多次。
    orders.forEach((order) => {
        order.goodsList = goods.filter((item) => order.id === item.order_id);
    });
    // 获取成功
    res.json({
        status: true,
        msg: "success!",
        data: orders,
    });
});
module.exports = router;

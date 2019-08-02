const express = require('express');
const router = express.Router();
// 数据库
let db = require('../../config/mysql');
/**
 * @api {get} /api/admin/order/list 获取所有账户订单列表
 * @apiDescription 获取系统中的订单列表，根据订单状态获取列表，具备分页功能
 * @apiName AdminOrderList
 * @apiGroup admin Order
 *
 * @apiParam {Number} [pageSize] 一个页有多少个商品,默认4个;
 * @apiParam {Number} [pageIndex] 第几页,默认1;
 * @apiParam {Number=0,3,4,5,all} status 订单状态:0-待付款，3-待发货，4-待收货，5-待评价，all-所有状态;
 *
 * @apiSampleRequest /api/admin/order/list
 */
router.get('/list', function (req, res) {
    let {pageSize = 4, pageIndex = 1, status = 'all'} = req.query;
    let size = parseInt(pageSize);
    let count = size * (pageIndex - 1);
    // 查询所有订单
    let sql =
        `SELECT o.id, o.create_time, o.payment, os.text AS status
		 FROM orders o JOIN order_status os ON o.order_state = os.CODE LIMIT ? OFFSET ?`;
    // 根据订单状态查询
    if (status != 'all') {
        sql =
            `SELECT o.id, o.create_time, o.payment, os.text AS status
			 FROM orders o JOIN order_status os ON o.order_state = os.CODE
			 WHERE o.order_state = ${status} LIMIT ? OFFSET ?`;
    }
    db.query(sql, [size, count], function (results, fields) {
        // 查询订单商品信息
        let data = results;
        let sql =
            `SELECT g.id, o.id AS order_id, g.name, g.img_md, og.goods_num, og.goods_price
			 FROM orders o JOIN order_goods og ON o.id = og.order_id
			 JOIN goods g ON g.id = og.goods_id`;
        if (status != 'all') {
            sql += ` WHERE o.order_state = ${status}`;
        }
        db.query(sql, [], (results, fields) => {
            data.forEach((order) => {
                if (!order.goodsList) {
                    order.goodsList = [];
                }
                results.forEach((goods) => {
                    if (order.id == goods.order_id) {
                        order.goodsList.push(goods);
                    }
                });
            });
            //成功
            res.json({
                status: true,
                msg: "success!",
                data
            });
        });
    });
});
module.exports = router;

const express = require('express');
const router = express.Router();
// 数据库
let pool = require('../../config/mysql');

/**
 * @apiDefine Authorization
 * @apiHeader {String} Authorization 需在请求headers中设置Authorization: `Bearer ${token}`，小程序登录成功code换取的token。
 */

/**
 * @api {post} /order/settle 获取"确认订单"页面的数据
 * @apiDescription 点击结算按钮之后传参至"确认订单"，此API返回"确认订单"页面需要的数据，此时订单需要用户确认商品价格、数量、支付金额，收货地址在此页面选择或者修改
 * @apiName SettleOrder
 * @apiGroup Order
 * @apiPermission user
 *
 * @apiUse Authorization
 *
 * @apiBody {Number[]} goods 欲购买商品id，格式：[id1,id2,id3];
 *
 * @apiSampleRequest /order/settle
 */

router.post('/settle', async function (req, res) {
    let { goods } = req.body;
    let { openid } = req.user;
    // 查询默认地址
    let address_sql = `SELECT * FROM address WHERE uid =? AND isDefault = 1 LIMIT 1`;
    let [[address]] = await pool.query(address_sql, [openid]);
    // 欲购买商品
    let goods_sql = `SELECT g.id,g.name,g.price,g.img_md,c.goods_num FROM goods g JOIN cart c ON g.id = c.goods_id  WHERE c.uid = ? AND c.goods_id IN (?)`;
    let [results] = await pool.query(goods_sql, [openid, goods]);
    // 成功
    res.json({
        status: true,
        msg: "获取成功!",
        data: { address, goods: results }
    });
});

/**
 * @api {post} /order/create 提交订单->生成订单
 * @apiDescription 在确认订单页面，提交订单按钮意味着将购物车中的商品转移到订单中，生成新的订单，称之为下单操作
 * @apiName CreateOrder
 * @apiGroup Order
 * @apiPermission user
 *
 * @apiUse Authorization
 *
 * @apiBody {Number} payment 支付金额,小数点至2位;
 * @apiBody {Number} addressId 收货地址id;
 * @apiBody {Object[]} goodsList 商品数组,包含每一个商品的id,数量，例：[{id:15,num:1},{id:16,num:2}];
 * @apiBody {Number} goodsList.id 商品id;
 * @apiBody {Number} goodsList.num 商品数量;
 *
 * @apiSampleRequest /order/create
 */

router.post('/create', async function (req, res) {
    let { addressId, payment, goodsList } = req.body;
    let { openid } = req.user;
    // 准备查询的商品id,方便使用IN
    let queryGid = goodsList.map((item) => item.id);
    // 获取一个连接
    const connection = await pool.getConnection();
    // 查询商品库存
    let select_sql = 'SELECT inventory FROM goods WHERE id IN (?)';
    let [results] = await connection.query(select_sql, [queryGid]);
    // 遍历每一个商品是否充足，every碰到第一个为false的，即终止执行
    let isAllPassed = results.every(function (item, index) {
        let { id, num } = goodsList[index];
        let isPassed = item.inventory >= num;
        if (isPassed === false) {
            res.json({
                status: false,
                msg: `id为${id}的商品，库存不足!`,
                data: { id },
            });
        }
        return isPassed;
    });
    // 库存不足,终止执行
    if (isAllPassed === false) {
        return;
    }
    try {
        // 开启事务
        await connection.beginTransaction();
        // 拼接减库存sql
        let update_sql = `UPDATE goods SET inventory = CASE id `;
        goodsList.forEach(function (item, index) {
            update_sql += `WHEN ${item.id} THEN inventory - ${item.num} `;
        });
        update_sql += `END WHERE id IN (?);`;
        // 1.库存充足,对应商品减库存
        let [{ affectedRows: update_affected_rows }] = await connection.query(update_sql, [queryGid]);
        if (update_affected_rows === 0) {
            await connection.rollback();
            res.json({ status: false, msg: "商品goods减库存失败！" });
            return;
        }

        // 2.订单表中生成新订单
        let insert_sql = `INSERT INTO orders (uid,payment,create_time) VALUES (?,?,CURRENT_TIMESTAMP())`;
        let [{ insertId, affectedRows: insert_affected_rows }] = await connection.query(insert_sql, [openid, payment]);
        if (insert_affected_rows === 0) {
            await connection.rollback();
            res.json({ status: false, msg: "生成新订单orders失败！" });
            return;
        }

        // 3.存储收货地址快照
        let copy_sql = `INSERT INTO order_address (order_id, name, tel, province, city, county, street, code) SELECT (?), name, tel, province, city, county, street, code FROM address WHERE id = ?`;
        let [{ affectedRows: copy_affected_rows }] = await connection.query(copy_sql, [insertId, addressId]);
        if (copy_affected_rows === 0) {
            await connection.rollback();
            res.json({ status: false, msg: "生成收货地址快照order_address失败！" });
            return;
        }
        // 4.购物车对应商品转移到order_goods表中
        let cut_sql = 'INSERT INTO order_goods ( order_id, goods_id, goods_num, goods_price ) SELECT (?), c.goods_id, c.goods_num, g.price FROM cart c JOIN goods g ON g.id = c.goods_id WHERE c.uid = ? AND c.goods_id IN (?)';
        let [{ affectedRows: cut_affected_rows }] = await connection.query(cut_sql, [insertId, openid, queryGid]);
        if (cut_affected_rows === 0) {
            await connection.rollback();
            res.json({ status: false, msg: "转移订单商品order_goods失败！" });
            return;
        }
        // 5.carts表删除对应商品
        let delete_sql = 'DELETE FROM cart WHERE uid = ? AND goods_id IN (?)';
        let [{ affectedRows: delete_affected_rows }] = await connection.query(delete_sql, [openid, queryGid]);
        if (delete_affected_rows === 0) {
            await connection.rollback();
            res.json({ status: false, msg: "移除购物车商品cart失败！" });
            return;
        }
        // 一切顺利，提交事务
        await connection.commit();
        // 创建成功
        res.json({
            status: true,
            msg: "success!",
            data: { order_id: insertId }
        });

    } catch (error) {
        await connection.rollback();
        res.json({
            status: false,
            msg: error.message,
            error,
        });

    }
});

/**
 * @api {get} /order/list 获取订单列表
 * @apiDescription 本账户uid中的订单列表，根据订单状态获取列表，具备分页功能
 * @apiName OrderList
 * @apiGroup Order
 * @apiPermission user
 *
 * @apiUse Authorization
 *
 * @apiQuery {Number} [pageSize=4] 一个页有多少个订单;
 * @apiQuery {Number} [pageIndex=1] 第几页;
 * @apiQuery {Number=0,3,4,5,all} status 订单状态:0-待付款，3-待发货，4-待收货，5-待评价，all-所有状态;
 *
 * @apiSampleRequest /order/list
 */

router.get('/list', async function (req, res) {
    let { pageSize = 4, pageIndex = 1, status = 'all' } = req.query;
    let { openid } = req.user;
    // 计算偏移量
    let size = parseInt(pageSize);
    let offset = size * (pageIndex - 1);
    // 查询订单信息
    let order_sql = `SELECT o.id, DATE_FORMAT(o.create_time,'%Y-%m-%d %H:%i:%s') AS create_time, o.payment, os.text AS status FROM orders o JOIN order_status os ON o.order_state = os.CODE WHERE o.uid = ?`;
    // 附加订单状态查询
    if (status !== 'all') {
        order_sql += ` AND o.order_state = ${status}`;
    }
    // 按照创建时间排序
    order_sql += ` ORDER BY o.create_time DESC LIMIT ? OFFSET ?`;
    let [orders] = await pool.query(order_sql, [openid, size, offset]);
    // 查询订单总数
    let total_sql = `SELECT COUNT(*) AS total FROM orders WHERE uid = ?`;
    let [total] = await pool.query(total_sql, [openid]);
    // 查询订单商品信息
    let goods_sql = `SELECT g.id, g.name, g.img_md, og.goods_num, og.goods_price, og.order_id FROM ( SELECT id FROM orders WHERE uid = ? ORDER BY create_time DESC LIMIT ? OFFSET ? ) AS o JOIN order_goods og ON og.order_id = o.id JOIN goods g ON g.id = og.goods_id`;
    let [goods] = await pool.query(goods_sql, [openid, size, offset]);
    // 循环遍历给订单数组添加订单商品信息
    orders.forEach((order) => {
        order.goodsList = goods.filter((item) => item.order_id === order.id);
    });
    // 获取成功
    res.json({
        status: true,
        msg: "success!",
        data: orders,
        ...total[0],
    });
});

module.exports = router;

var express = require('express');
var router = express.Router();
// 数据库
let db = require('../config/mysql');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', {
		title: 'Express'
	});
});
/**
 * @api {get} /api/goods/ 获取商品列表
 * @apiDescription 具备商品分页功能，3个分类参数至多能传1个
 * @apiName GoodsList 获取商品列表
 * @apiGroup Goods
 * 
 * @apiParam {Number} [pageSize] 一个页有多少个商品,默认4个;
 * @apiParam {Number} [pageIndex] 第几页,默认1;
 * @apiParam {Number} [cate_1st] 一级分类id;
 * @apiParam {Number} [cate_2nd] 二级分类id;
 * @apiParam {Number} [cate_3rd] 三级分类id;
 * @apiParam {String="ASC","DESC"} [sortByPrice] 按照价格排序，从小到大-ASC,从大到小-DESC;
 * @apiSampleRequest /api/goods/
 */
router.get("/goods/", function(req, res) {
	let query = req.query;
	//取出空键值对
	for (let key in query) {
		if (!query[key]) {
			delete query[key]
		}
	}
	//拼接SQL
	function produceSQL({ pageSize = 4, pageIndex = 1, sortByPrice = '', cate_1st = '', cate_2nd = '', cate_3rd = '', }) {
		let size = parseInt(pageSize);
		let count = size * (pageIndex - 1);
		let sql = `SELECT id,name,price,hotPoint,marketPrice,discount,img_md FROM GOODS `
		if (cate_1st) {
			sql += `WHERE cate_1st = ${cate_1st}`;
		}
		if (cate_2nd) {
			sql += `WHERE cate_2nd = ${cate_2nd}`;
		}
		if (cate_3rd) {
			sql += `WHERE cate_3rd = ${cate_3rd}`;
		}
		sql += ` ORDER BY create_time DESC , price ${sortByPrice} LIMIT ${count},${size}`
		return sql;
	}
	db.query(produceSQL(req.query), [], function(results, fields) {
		//成功
		res.json({
			status: true,
			msg: "success!",
			data: results
		});
	});
});
/**
 * @api {get} /api/goods/detail/ 获取商品详情
 * @apiName GoodsDetail
 * @apiGroup Goods
 * 
 * @apiParam {Number} id 商品id;
 * 
 * @apiSampleRequest /api/goods/detail/
 */
router.get("/goods/detail/", function(req, res) {
	let sql = `SELECT id,name,price,hotPoint,marketPrice,discount,slider,detail FROM GOODS WHERE id = ?`
	db.query(sql, [req.query.id], function(results, fields) {
		//成功
		res.json({
			status: true,
			msg: "success!",
			data: results[0]
		});
	});
});
/**
 * @api {post} /api/cart/add/ 添加商品至购物车
 * @apiName AddCart
 * @apiGroup Cart
 * 
 * @apiParam {Number} gid 商品id;
 * @apiParam {Number} num 商品数量,不能超过库存;
 * 
 * @apiSampleRequest /api/cart/add/
 */
router.post('/cart/add/', function(req, res) {
	let { gid, num } = req.body;
	let { openid } = req.user;
	// 检查购物车是否已经有此商品
	let sql = `SELECT * FROM carts WHERE goods_id = ?`;
	db.query(sql, [gid], function(results, fields) {
		// 没有此商品,插入新纪录
		sql =
			`INSERT INTO carts ( uid , goods_id , goods_num , create_time )
			VALUES ( '${openid}' , ${gid} , ${num} ,CURRENT_TIMESTAMP())`;
		// 已有此商品，增加数量
		if (results.length > 0) {
			sql =
				`UPDATE carts SET goods_num = goods_num + ${num} WHERE goods_id = ${gid} AND uid = '${openid}'`;
		}
		db.query(sql, function(results, fields) {
			//成功
			res.json({
				status: true,
				msg: "success!"
			});
		});
	});
});
/**
 * @api {get} /api/cart/ 获取购物车列表
 * @apiName CartList
 * @apiGroup Cart
 * 
 * @apiSampleRequest /api/cart/
 */
router.get('/cart/', function(req, res) {
	let { openid } = req.user;
	let sql =
		`SELECT carts.id, carts.goods_id, goods.img_md AS img, goods.name, goods.price, carts.goods_num 
		FROM carts JOIN goods 
		WHERE carts.uid = ? AND carts.goods_id = goods.id`;
	db.query(sql, [openid], function(results, fields) {
		//成功
		res.json({
			status: true,
			msg: "success!",
			data: results
		});
	});
});
/**
 * @api {post} /api/cart/delete/ 购物车删除商品
 * @apiName DeleteCart
 * @apiGroup Cart
 * 
 * @apiParam {Number} id 购物车条目id;
 * 
 * @apiSampleRequest /api/cart/delete/
 */
router.post('/cart/delete/', function(req, res) {
	let { id } = req.body;
	let sql = `DELETE FROM carts WHERE id = ?`;
	db.query(sql, [id], function(results, fields) {
		//成功
		res.json({
			status: true,
			msg: "success!",
		});
	});
})
/**
 * @api {post} /api/cart/increase/ 购物车增加商品数量
 * @apiDescription 增加商品数量，后台查询库存，注意提示库存不足
 * @apiName IncreaseCart
 * @apiGroup Cart
 * 
 * @apiParam {Number} id 购物车条目id;
 * @apiParam {Number} gid 商品id;
 * @apiParam {Number{1-库存MAX}} num 商品数量;
 * 
 * @apiSampleRequest /api/cart/increase/
 */
router.post('/cart/increase/', function(req, res) {
	let { id, gid, num } = req.body;
	// 检查库存
	let sql = `SELECT goods_num FROM carts WHERE id = ?;
	SELECT inventory FROM goods WHERE id = ?`;
	db.query(sql, [id, gid], function(results, fields) {
		let isEmpty = results[1][0].inventory - results[0][0].goods_num - num >= 0 ? false : true;
		if (isEmpty) {
			res.json({
				status: false,
				msg: "库存不足!"
			});
			return;
		}
		let sql = `UPDATE carts SET goods_num = goods_num + ? WHERE id = ?`;
		db.query(sql, [num, id], function(results, fields) {
			//成功
			res.json({
				status: true,
				msg: "success!",
			});
		});
	});

})
/**
 * @api {post} /api/cart/decrease/ 购物车减少商品数量
 * @apiDescription 减少商品数量，前台注意约束num，商品数量>=1
 * @apiName DecreaseCart
 * @apiGroup Cart
 * 
 * @apiParam {Number} id 购物车条目id;
 * @apiParam {Number{1-库存MAX}} num 商品数量;
 * 
 * @apiSampleRequest /api/cart/decrease/
 */
router.post('/cart/decrease/', function(req, res) {
	let { id, num } = req.body;
	let sql = `UPDATE carts SET goods_num = goods_num - ? WHERE id = ?`;
	db.query(sql, [num, id], function(results, fields) {
		//成功
		res.json({
			status: true,
			msg: "success!",
		});
	});
});
/**
 * @api {post} /api/order/settle/ 确认订单页面
 * @apiDescription 点击结算按钮之后传参至"确认订单"，此API返回"确认订单"页面需要的数据，此时订单需要用户确认商品价格、数量、支付金额，收货地址在此页面选择或者修改
 * @apiName SettleOrder
 * @apiGroup Order
 * 
 * @apiParam {Number[]} goods 欲购买商品id，格式：[id1,id2,id3];
 * 
 * @apiSampleRequest /api/order/settle/
 */
router.post('/order/settle/', function(req, res) {
	let { goods } = req.body;
	let { openid } = req.user;
	// 多表查询
	let data = {};
	let sql = `SELECT * FROM addresses WHERE uid =? AND isDefault =1 LIMIT 1`;
	db.query(sql, [openid], function(results, fields) {
		data.address = results[0];
		let sql =
			`SELECT goods.id,goods.name,goods.price,goods.img_md,carts.goods_num FROM goods JOIN carts ON goods.id = carts.goods_id  WHERE carts.uid = ? AND carts.goods_id IN (?)`;
		db.query(sql, [openid, goods], function(results, fields) {
			data.goods = results;
			//成功
			res.json({
				status: true,
				msg: "success!",
				data
			});
		});
	});
})
/**
 * @api {post} /api/order/create/ 提交订单->生成订单
 * @apiDescription 在确认订单页面，提交订单按钮意味着将购物车中的商品转移到订单中，生成新的订单，称之为下单操作
 * @apiName CreateOrder
 * @apiGroup Order
 * 
 * @apiParam {Number} payment 支付金额,小数点至2位;
 * @apiParam {Number} addressId 收货地址id;
 * @apiParam {Object[]} goodsList 商品数组,包含每一个商品的id,数量，例：[{id:15,num:1},{id:16,num:2}];
 * @apiParam {Number} goodsList.id 商品id;
 * @apiParam {Number} goodsList.num 商品数量;
 * 
 * @apiSampleRequest /api/order/create/
 */
router.post('/order/create/', function(req, res) {
	// 准备查询的商品id,方便使用IN
	let queryGid = [];
	let { addressId, payment, goodsList } = req.body;
	let { openid } = req.user;
	goodsList.forEach(function(item) {
		queryGid.push(item.id);
	});
	// 检查库存是否充足
	let sql = `SELECT inventory FROM goods WHERE id IN (?)`;
	db.query(sql, [queryGid], function(results, fields) {
		// every碰到第一个为false的，即终止执行
		let isAllPassed = results.every(function(item, index) {
			let isPassed = item.inventory >= goodsList[index].num;
			if (isPassed == false) {
				res.json({
					status: false,
					msg: `id为${goodsList[index].id}的商品，库存不足!`,
					data: {
						id: goodsList[index].id
					}
				});
			}
			return isPassed;
		});
		// 库存不足,终止执行
		if (isAllPassed == false) {
			return;
		}
		// 数据库事务
		let { pool } = db;
		pool.getConnection(function(err, connection) {
			if (err) {
				throw err;
			}
			connection.beginTransaction(function(error) {
				// 库存充足,对应商品减库存,拼接SQL
				let sql = `UPDATE goods SET  inventory = CASE id `;
				goodsList.forEach(function(item, index) {
					sql += `WHEN ${item.id} THEN inventory - ${item.num} `;
				});
				sql += `END WHERE id IN (${queryGid});`;
				connection.query(sql, function(error, results, fields) {
					if (error || results.changedRows <= 0) {
						return connection.rollback(function() {
							throw error || `${results.changedRows} rows changed!`;
						});
					}
					// 订单表中生成新订单
					let sql = `INSERT INTO orders (uid,payment,create_time) VALUES (?,?,CURRENT_TIMESTAMP())`;
					connection.query(sql, [openid, payment], function(error, results, fields) {
						// 提取新订单id
						let { insertId, affectedRows } = results;
						if (error || affectedRows <= 0) {
							return connection.rollback(function() {
								throw error || `${affectedRows} rows affected!`;
							});
						}
						// 存储收货地址快照
						let sql =
							`INSERT INTO order_addresses ( order_id, name, tel, province, city, area, street, code )
							 SELECT ( ? ), name, tel, province, city, area, street, code
							 FROM addresses WHERE id = ?`;
						connection.query(sql, [insertId, addressId], function(error, results, fields) {
							let { affectedRows } = results;
							console.log(affectedRows);
							if (error || affectedRows <= 0) {
								return connection.rollback(function() {
									throw error || `${affectedRows} rows affected!`;
								});
							}
							// 购物车对应商品复制到order_goods表中，carts表删除对应商品
							let sql =
								`INSERT INTO order_goods ( order_id, goods_id, goods_num, goods_price ) 
									SELECT ( ? ), carts.goods_id, carts.goods_num, goods.price
									FROM carts JOIN goods ON goods.id = carts.goods_id 
									WHERE carts.uid = ? AND carts.goods_id IN (?);
									DELETE FROM carts WHERE carts.uid = ? AND goods_id IN (?)`;
							connection.query(sql, [insertId, openid, queryGid, openid, queryGid], function(error, results,
								fields) {
								if (error) {
									return connection.rollback(function() {
										throw error;
									});
								}
								connection.commit(function(err) {
									if (err) {
										return connection.rollback(function() {
											throw err;
										});
									}
									res.json({
										status: true,
										msg: "success!",
										data: {
											order_id: insertId
										}
									});
								});
							});
						});
					});
				});
			});
		});
	});
});
/**
 * @api {post} /api/order/list/ 获取订单列表
 * @apiDescription 本账户uid中的订单列表，根据订单状态获取列表，具备分页功能
 * @apiName OrderList
 * @apiGroup Order
 * 
 * @apiParam {Number} [pageSize] 一个页有多少个商品,默认4个;
 * @apiParam {Number} [pageIndex] 第几页,默认1;
 * @apiParam {Number=0,3,4,5} status 订单状态:0-待付款，3-待发货，4-待收货，5-待评价;
 * 
 * @apiSampleRequest /api/order/list/
 */
router.post('/order/list/', function(req, res) {
	let { pageSize = 4, pageIndex = 1, status } = req.body;
	let { openid } = req.user;
	let size = parseInt(pageSize);
	let count = size * (pageIndex - 1);
	// 查询订单信息
	let sql =
		`SELECT o.id, o.create_time, o.payment, os.text AS status
		 FROM orders o JOIN order_status os ON o.order_state = os.CODE
		 WHERE o.uid = ? AND o.order_state = ? LIMIT ?, ?`;
	db.query(sql, [openid, status, count, size], function(results, fields) {
		// 查询订单商品信息
		let data = results;
		let sql =
			`SELECT g.id, o.id AS order_id, g.name, g.img_md, og.goods_num, og.goods_price
			 FROM orders o JOIN order_goods og ON o.id = og.order_id
			 JOIN goods g ON g.id = og.goods_id
			 WHERE o.uid = ? AND o.order_state = ?`;
		db.query(sql, [openid, status], (results, fields) => {
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

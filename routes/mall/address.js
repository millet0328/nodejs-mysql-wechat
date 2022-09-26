const express = require('express');
const router = express.Router();
// 数据库
let pool = require('../../config/mysql');

/**
 * @apiDefine Authorization
 * @apiHeader {String} Authorization 需在请求headers中设置Authorization: `Bearer ${token}`，小程序登录成功code换取的token。
 */

/**
 * @api {post} /address 添加收货地址
 * @apiName addressAdd
 * @apiGroup Address
 * @apiPermission user
 *
 * @apiUse Authorization
 *
 * @apiBody {String} name 收货人姓名.
 * @apiBody {String} tel 电话.
 * @apiBody {String} province 省份.
 * @apiBody {String} city 市.
 * @apiBody {String} county 区县.
 * @apiBody {String} street 详细地址.
 * @apiBody {String} code 邮编.
 * @apiBody {Number=1,0} isDefault 是否默认 1-默认,0-否.
 *
 * @apiSampleRequest /address/
 */
router.post('/', async function (req, res) {
    let { name, tel, province, city, county, street, code, isDefault } = req.body;
    let { openid } = req.user;
    // 获取一个连接
    const connection = await pool.getConnection();

    try {
        // 开启事务
        await connection.beginTransaction();
        // 判断是否默认地址，如果是默认地址，其他地址取消默认
        if (isDefault === '1') {
            let update_sql = 'UPDATE address SET isDefault = 0 WHERE uid = ?';
            await connection.query(update_sql, [openid]);
        }
        // 添加address
        let insert_sql = `INSERT INTO address(uid, name, tel, province, city, county, street, code, isDefault) VALUES(?,?,?,?,?,?,?,?,?)`;
        let [{ insertId, affectedRows: address_affected_rows }] = await connection.query(insert_sql, [openid, name, tel, province, city, county, street, code, isDefault]);
        if (address_affected_rows === 0) {
            await connection.rollback();
            res.json({ status: false, msg: "地址address创建失败！" });
            return;
        }
        // 一切顺利，提交事务
        await connection.commit();
        // 创建成功
        res.json({
            status: true,
            msg: "创建成功!",
            data: { id: insertId }
        });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({
            status: false,
            msg: error.message,
            error,
        });
    }
});
/**
 * @api {delete} /address/:id 删除收货地址
 * @apiName addressDelete
 * @apiGroup Address
 * @apiPermission user
 *
 * @apiUse Authorization
 *
 * @apiParam {Number} id 收货地址id.
 *
 * @apiSampleRequest /address
 */
router.delete("/:id", async function (req, res) {
    let { id } = req.params;
    let { openid } = req.user;
    // 获取一个连接
    const connection = await pool.getConnection();
    // 判断是否默认地址
    let select_sql = 'SELECT * FROM `address` WHERE id = ?';
    let [[address]] = await connection.query(select_sql, [id]);

    try {
        // 开启事务
        await connection.beginTransaction();
        // 删除地址
        let delete_sql = `DELETE FROM address WHERE id = ?`
        let [{ affectedRows: delete_affected_rows }] = await pool.query(delete_sql, [id]);
        if (delete_affected_rows === 0) {
            await connection.rollback();
            res.json({ status: false, msg: "删除失败！" });
            return;
        }
        // 如果删除的是默认收货地址，设置第一条地址为默认地址
        if (address.isDefault === 1) {
            let update_sql = `UPDATE address SET isDefault = 1 WHERE uid = ? LIMIT 1`;
            await pool.query(update_sql, [openid]);
        }
        // 一切顺利，提交事务
        await connection.commit();
        // 删除成功
        res.json({
            status: true,
            msg: "删除成功！"
        });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({
            status: false,
            msg: error.message,
            error,
        });
    }
})
/**
 * @api {put} /address/:id 修改收货地址
 * @apiName addressUpdate
 * @apiGroup Address
 * @apiPermission user
 *
 * @apiUse Authorization
 *
 * @apiParam {Number} id 收货地址id.
 * @apiBody {String} name 收货人姓名.
 * @apiBody {String} tel 电话.
 * @apiBody {String} province 省份.
 * @apiBody {String} city 市.
 * @apiBody {String} county 区县.
 * @apiBody {String} street 详细地址.
 * @apiBody {String} code 邮编.
 * @apiBody {Number=1,0} isDefault 是否默认.1-默认,0-否.
 *
 * @apiSampleRequest /address/
 */
router.put("/:id", async function (req, res) {
    let { name, tel, province, city, county, street, code, isDefault } = req.body;
    let { id } = req.params;
    let { openid } = req.user;
    // 获取一个连接
    const connection = await pool.getConnection();

    try {
        // 开启事务
        await connection.beginTransaction();
        // 判断是否默认地址，如果是默认地址，其他地址取消默认
        if (isDefault === '1') {
            let update_sql = 'UPDATE address SET isDefault = 0 WHERE uid = ?';
            await connection.query(update_sql, [openid]);
        }
        // 修改address
        let update_sql = `UPDATE address SET name = ?, tel = ?, province = ?, city = ?, county = ?, street = ?, code = ?, isDefault = ? WHERE id = ?`;
        let [{ affectedRows: address_affected_rows }] = await connection.query(update_sql, [name, tel, province, city, county, street, code, isDefault, id]);
        if (address_affected_rows === 0) {
            await connection.rollback();
            res.json({ status: false, msg: "地址address更新失败！" });
            return;
        }
        // 一切顺利，提交事务
        await connection.commit();
        // 创建成功
        res.json({
            status: true,
            msg: "修改成功!",
        });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({
            status: false,
            msg: error.message,
            error,
        });
    }
});

/**
 * @api {get} /address/list 获取收货地址列表
 * @apiName addressList
 * @apiGroup Address
 * @apiPermission user
 *
 * @apiUse Authorization
 *
 * @apiQuery { Number } [pagesize=10] 每一页数量.
 * @apiQuery { Number } [pageindex=1] 第几页.
 *
 * @apiSampleRequest /address/list
 */

router.get('/list', async function (req, res) {
    let { openid } = req.user;
    let { pagesize = 10, pageindex = 1 } = req.query;
    // 计算偏移量
    pagesize = parseInt(pagesize);
    const offset = pagesize * (pageindex - 1);
    // 查找地址
    let select_sql = 'SELECT * FROM address WHERE uid = ? ORDER BY isDefault DESC LIMIT ? OFFSET ?';
    let [address] = await pool.query(select_sql, [openid, pagesize, offset]);
    // 计算总数
    let total_sql = `SELECT COUNT(*) as total FROM address WHERE uid = ?`;
    let [total] = await pool.query(total_sql, [openid]);

    if (!address.length) {
        res.json({
            status: false,
            msg: "暂无收货地址！"
        });
        return false;
    }
    res.json({
        status: true,
        msg: "获取成功！",
        data: address,
        ...total[0],
    });
});
/**
 * @api {get} /address 根据id获取收货地址详情
 * @apiName addressDetail
 * @apiGroup Address
 * @apiPermission user
 *
 * @apiUse Authorization
 *
 * @apiQuery {Number} id 收货地址id.
 *
 * @apiSampleRequest /address
 */
router.get("/", async function (req, res) {
    let { id } = req.query;
    let sql = `SELECT * FROM address WHERE id = ? `;
    let [results] = await pool.query(sql, [id]);
    if (!results.length) {
        res.json({
            status: false,
            msg: "暂无收货地址信息！"
        });
        return;
    }
    res.json({
        status: true,
        data: results[0],
        msg: "获取成功！"
    });
});

module.exports = router;

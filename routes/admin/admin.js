const express = require('express');
const router = express.Router();
// 数据库
let pool = require('../../config/mysql');
// JSON Web Token
const jwt = require("jsonwebtoken");

/**
 * @apiDefine Authorization
 * @apiHeader {String} Authorization 需在请求headers中设置Authorization: `Bearer ${token}`，登录/注册成功返回的token。
 */

/**
 * @apiDefine SuccessResponse
 * @apiSuccess { Boolean } status 请求状态.
 * @apiSuccess { String } msg 请求结果信息.
 * @apiSuccess { Object } data 请求结果信息.
 * @apiSuccess { String } data.token 响应返回的token.
 * @apiSuccess { String } data.id 账户id.
 * @apiSuccess { String } data.role 账户角色id.
 *
 * @apiSuccessExample { json } 200返回的JSON:
 *  HTTP / 1.1 200 OK
 *  {
 *      "status": true,
 *      "msg": "成功",
 *      "data":{
 *          "id":5,
 *          "role":3,
 *          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwidXNlcm5hbWUiOiIxIiwiaWF0IjoxNTU3MzM1Mzk3LCJleHAiOjE1NTczNDI1OTd9.vnauDCSHdDXaZyvTjNOz0ezpiO-UACbG-oHg_v76URE"
 *      }
 *  }
 */

/**
 * @api {post} /admins/register 管理员注册
 * @apiDescription 注册成功，默认角色为运营人员，默认生成头像地址："/images/avatar/default.jpg"， 返回token, 请在头部headers中设置Authorization: `Bearer ${token}`,所有请求都必须携带token;
 * @apiName AdminRegister
 * @apiGroup Admin
 * @apiPermission admin
 *
 * @apiBody { String } username 用户名.
 * @apiBody { String } password 密码.
 * @apiBody { String } fullname 姓名.
 * @apiBody { String="男","女" } sex 性别.
 * @apiBody { String } tel 手机号码.
 * @apiBody { String } [email] 邮箱地址.
 *
 * @apiUse SuccessResponse
 *
 * @apiSampleRequest /admins/register
 */

//TODO 新注册管理员默认无法登陆，需审核通过
router.post('/register', async function (req, res) {
    let { username, password, fullname, sex, tel, email } = req.body;
    // 获取一个连接
    const connection = await pool.getConnection();
    // 默认头像
    let defaultAvatar = `${process.env.server}/images/avatar/default.jpg`;
    // 查询账户是否存在
    let select_sql = `SELECT * FROM ADMIN WHERE username = ?`;
    let [results] = await connection.query(select_sql, [username]);
    if (results.length > 0) {
        res.json({
            status: false,
            msg: "账号已经存在！"
        });
        return false;
    }

    try {
        // 开启事务
        await connection.beginTransaction();
        // 创建新账户
        let insert_admin_sql = 'INSERT INTO admin (username, password, fullname, sex, tel, email, avatar) VALUES (?,?,?,?,?,?,?)';
        let [{ insertId, affectedRows: admin_affected_rows }] = await connection.query(insert_admin_sql, [username, password, fullname, sex, tel, email, defaultAvatar]);
        if (admin_affected_rows === 0) {
            await connection.rollback();
            res.json({ status: false, msg: "账户admin创建失败！" });
            return;
        }
        // 给新账户分配角色，默认角色为3
        let role_sql = `INSERT INTO admin_role (admin_id,role_id) VALUES (?,3)`;
        let [{ affectedRows: role_affected_rows }] = await connection.query(role_sql, [insertId]);
        if (role_affected_rows === 0) {
            await connection.rollback();
            res.json({ status: false, msg: "默认角色admin_role设置失败！" });
            return;
        }
        // 生成token
        let payload = { id: insertId, username, role: 3, };
        let token = jwt.sign(payload, 'secret', { expiresIn: '4h' });

        // 一切顺利，提交事务
        await connection.commit();
        // 注册成功
        res.json({
            status: true,
            msg: "注册成功！",
            data: { token, id: insertId, role: 3 }
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
 * @api {post} /admins/login 管理员登录
 * @apiDescription 登录成功， 返回token, 请在头部headers中设置Authorization: `Bearer ${token}`, 所有请求都必须携带token;
 * @apiName AdminLogin
 * @apiGroup Admin
 * @apiPermission admin
 *
 * @apiBody {String} username 账户名.
 * @apiBody {String} password 密码.
 *
 * @apiUse SuccessResponse
 *
 * @apiSampleRequest /admins/login
 */

router.post('/login', async function (req, res) {
    let { username, password } = req.body;
    let select_sql = `SELECT a.*,r.id AS role FROM ADMIN a LEFT JOIN admin_role ar ON a.id = ar.admin_id LEFT JOIN role r ON r.id = ar.role_id WHERE username = ? AND password = ?`;
    // 判断账号密码是否错误
    let [results] = await pool.query(select_sql, [username, password]);
    // 账号密码错误
    if (results.length === 0) {
        res.json({
            status: false,
            msg: "账号或者密码错误！"
        });
        return false;
    }
    // 账号密码正确
    let { id, role } = results[0];
    //TODO 记录登陆状态

    // 生成token
    let payload = { id, username, role, };
    let token = jwt.sign(payload, 'secret', { expiresIn: '4h' });
    // 登录成功
    res.json({
        status: true,
        msg: "登录成功！",
        data: { token, id, role, }
    });
});

/**
 * @api {get} /admins/list 获取管理员列表
 * @apiName AdminList
 * @apiGroup Admin
 * @apiPermission admin
 *
 * @apiUse Authorization
 *
 * @apiQuery { Number } [pagesize=10] 每一页数量.
 * @apiQuery { Number } [pageindex=1] 第几页.
 *
 * @apiSampleRequest /admins/list
 */

router.get("/list", async function (req, res) {
    let { pagesize = 10, pageindex = 1 } = req.query;
    // 计算偏移量
    pagesize = parseInt(pagesize);
    const offset = pagesize * (pageindex - 1);
    //查询账户数据
    const sql = 'SELECT a.id,a.username,a.fullname,a.sex,a.email,a.avatar,a.tel,r.role_name,r.id AS role_id FROM `admin` AS a LEFT JOIN admin_role AS ar ON a.id = ar.admin_id LEFT JOIN role AS r ON r.id = ar.role_id LIMIT ? OFFSET ?; SELECT COUNT(*) as total FROM `admin`;';
    let [results] = await pool.query(sql, [pagesize, offset]);
    // 获取成功
    res.json({
        status: true,
        msg: "获取成功",
        ...results[1][0],
        data: results[0],
    });
});

/**
 * @api {delete} /admins/:id 删除管理员
 * @apiName DeleteAdmin
 * @apiGroup Admin
 * @apiPermission admin
 *
 * @apiExample {js} 参数示例:
 * /admins/3
 *
 * @apiUse Authorization
 *
 * @apiParam {Number} id 账户id.
 *
 * @apiSampleRequest /admins
 */

router.delete('/:id', async function (req, res) {
    let { id } = req.params;
    // 获取一个连接
    const connection = await pool.getConnection();
    try {
        // 开启事务
        await connection.beginTransaction();
        // 删除账户
        let delete_admin_sql = `DELETE FROM admin WHERE id = ?`;
        let [{ affectedRows: admin_affected_rows }] = await connection.query(delete_admin_sql, [id]);
        if (admin_affected_rows === 0) {
            await connection.rollback();
            res.json({ status: false, msg: "账户admin删除失败！" });
            return;
        }
        // 删除角色
        let delete_role_sql = `DELETE FROM admin_role WHERE admin_id = ?`;
        await connection.query(delete_role_sql, [id]);
        // 一切顺利，提交事务
        await connection.commit();
        res.json({
            status: true,
            msg: "删除成功"
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
 * @api {get} /admins 获取管理员个人资料
 * @apiName AdminInfo
 * @apiGroup Admin
 * @apiPermission admin
 *
 * @apiUse Authorization
 *
 * @apiQuery {Number} id 账户id.
 *
 * @apiSampleRequest /admins
 */

router.get("/", async function (req, res) {
    let { id } = req.query;
    //查询账户数据
    let sql = `SELECT a.id,a.username,a.fullname,a.email,a.sex,a.avatar,a.tel,r.role_name,r.id AS role_id FROM ADMIN AS a LEFT JOIN admin_role AS ar ON a.id = ar.admin_id LEFT JOIN role AS r ON r.id = ar.role_id WHERE a.id = ?`;
    let [results] = await pool.query(sql, [id]);
    if (!results.length) {
        res.json({
            status: false,
            msg: "获取失败！"
        });
        return false;
    }
    // 获取成功
    res.json({
        status: true,
        msg: "获取成功！",
        data: results[0]
    });
});

// TODO 检测用户名是否可用

/**
 * @api { put } /admins/ 更新管理员个人资料
 * @apiDescription 只有超级管理员才有权限修改用户角色，普通管理员无权限更改角色。
 * @apiName UpdateInfo
 * @apiGroup Admin
 * @apiPermission 超级管理员
 *
 * @apiUse Authorization
 *
 * @apiBody { Number } id 管理员id.
 * @apiBody { String } username 用户名.
 * @apiBody { String } fullname 姓名.
 * @apiBody { String } role_id 角色id.
 * @apiBody { String="男","女" } sex 性别.
 * @apiBody { String } tel 手机号码.
 * @apiBody { String } email 邮箱地址.
 * @apiBody { String } avatar 头像地址.
 *
 * @apiSampleRequest /admins
 */

router.put("/", async function (req, res) {
    let { id, username, fullname, role_id, sex, tel, email, avatar } = req.body;
    // 获取一个连接
    const connection = await pool.getConnection();

    try {
        // 开启事务
        await connection.beginTransaction();
        // 更新管理员信息
        let update_admin_sql = 'UPDATE admin SET username = ?,fullname = ?,sex = ?,tel = ?,email = ?, avatar = ? WHERE id = ?;';
        let [{ affectedRows: admin_affected_rows }] = await connection.query(update_admin_sql, [username, fullname, sex, tel, email, avatar, id]);
        if (admin_affected_rows === 0) {
            await connection.rollback();
            res.json({ status: false, msg: "账户admin修改失败！" });
            return;
        }
        // 更新角色
        let update_role_sql = 'UPDATE admin_role SET role_id = ? WHERE admin_id = ?';
        let [{ affectedRows: role_affected_rows }] = await connection.query(update_role_sql, [role_id, id]);
        if (role_affected_rows === 0) {
            await connection.rollback();
            res.json({ status: false, msg: "角色role修改失败！" });
            return;
        }
        // 一切顺利，提交事务
        await connection.commit();
        res.json({
            status: true,
            msg: "修改成功!"
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
 * @api { put } /admins/account 修改本账户信息
 * @apiDescription 管理员自行修改本账户信息，但是无权限分配角色。
 * @apiName UpdateAccount
 * @apiGroup Admin
 * @apiPermission admin
 *
 * @apiUse Authorization
 *
 * @apiBody { String } username 用户名.
 * @apiBody { String } fullname 姓名.
 * @apiBody { String="男","女" } sex 性别.
 * @apiBody { String } tel 手机号码.
 * @apiBody { String } email 邮箱地址.
 * @apiBody { String } avatar 头像地址.
 *
 * @apiSampleRequest /admins/account
 */

router.put("/account/", async function (req, res) {
    let { id } = req.user;
    let { username, fullname, sex, avatar, tel, email } = req.body;
    let sql = `UPDATE admin SET fullname = ?,sex = ?,avatar = ?,tel = ?,email = ? WHERE id = ?`;
    let [{ affectedRows }] = await pool.query(sql, [fullname, sex, avatar, tel, email, id]);
    if (affectedRows === 0) {
        res.json({
            status: false,
            msg: "修改失败！"
        });
        return;
    }
    res.json({
        status: true,
        msg: "修改成功！"
    });
});

module.exports = router;

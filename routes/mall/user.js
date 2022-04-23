const express = require('express');
const router = express.Router();
const axios = require('axios');
// JSON Web Token
const jwt = require("jsonwebtoken");
// 数据库
let pool = require('../../config/mysql');
// 微信小程序
let { appid, appSecret } = require("../../config/wx");

/**
 * @apiDefine Authorization
 * @apiHeader {String} Authorization 需在请求headers中设置Authorization: `Bearer ${token}`，小程序登录成功code换取的token。
 */

/**
 * @api {post} /user/token 换取登录token
 * @apiDescription 微信小程序login之后，获得临时登录凭证code，再使用code换取登录token,请在头部headers中设置Authorization: `Bearer ${token}`,所有请求都必须携带token;
 * @apiName Token
 * @apiGroup User
 * @apiPermission user
 *
 * @apiBody {String} code 微信临时登录凭证code.
 *
 * @apiSampleRequest /user/token
 */
router.post('/token', async (req, res) => {
    let { code } = req.body;
    // 请求微信API
    let url = 'https://api.weixin.qq.com/sns/jscode2session';
    try {
        let { status, statusText, data: { openid, session_key, errcode, errmsg } } = await axios.get(url, {
            params: { appid, secret: appSecret, js_code: code, grant_type: "authorization_code" }
        })
        if (status !== 200) {
            res.json({
                status: false,
                msg: statusText
            });
            return;
        }
        // 微信api返回错误
        if (errcode) {
            res.json({
                status: false,
                msg: errmsg
            });
            return;
        }
        // 生成token
        let token = jwt.sign({ openid, session_key }, 'secret');
        // 查询数据库中是否有此openid
        let select_sql = 'SELECT * FROM user WHERE openid = ?';
        let [results] = await pool.query(select_sql, [openid]);
        // 如果没有此openid，插入新的数据
        if (results.length === 0) {
            let insert_sql = 'INSERT INTO user (openid,session_key) VALUES (?,?)';
            let [{ affectedRows: insert_affectedRows }] = await pool.query(insert_sql, [openid, session_key]);
            if (insert_affectedRows > 0) {
                res.json({
                    status: true,
                    token: token
                });
            }
            return;
        }
        // 如果有此openid，更新session_key的数据
        let update_sql = 'UPDATE user SET session_key = ? WHERE openid = ?';
        let [{ affectedRows: update_affectedRows }] = await pool.query(update_sql, [session_key, openid]);
        if (update_affectedRows > 0) {
            res.json({
                status: true,
                token: token
            });
        }
    } catch (error) {
        res.json({
            status: false,
            msg: error.message,
            error,
        });
    }
});
/**
 * @api {put} /user/info 上传微信用户信息
 * @apiName userInfoUpload
 * @apiGroup User
 * @apiPermission user
 *
 * @apiUse Authorization
 *
 * @apiBody { String } nickName 用户昵称.
 * @apiBody { Number } gender 性别.
 * @apiBody { String } avatarUrl 头像.
 * @apiBody { String } country 国家.
 * @apiBody { String } province 省.
 * @apiBody { String } city 市.
 *
 * @apiSampleRequest /user/info
 */
router.put("/info", async (req, res) => {
    try {
        let { nickName, gender, avatarUrl, country, province, city } = req.body;
        let { openid } = req.user;
        let sql = `UPDATE user SET nickname = ?, sex = ?, avatar = ?, country = ?, province = ?, city = ? WHERE openid = ?`;
        let [{ affectedRows }] = await pool.query(sql, [nickName, gender, avatarUrl, country, province, city, openid]);
        if (affectedRows === 0) {
            res.json({
                status: false,
                msg: "存储信息失败！",
            })
        }
        res.json({
            status: true,
            msg: "存储信息成功！",
        })
    } catch (error) {
        res.json({
            status: false,
            msg: error.message,
            error,
        });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const request = require('request');
// JSON Web Token
const jwt = require("jsonwebtoken");
// 数据库
let db = require('../../config/mysql');
// 微信小程序
let { appid, appSecret } = require("../../config/wx");
/**
 * @api {post} /api/user/token 换取登录token
 * @apiDescription 微信小程序login之后，获得临时登录凭证code，再使用code换取登录token,请在头部headers中设置Authorization: `Bearer ${token}`,所有请求都必须携带token;
 * @apiName Token
 * @apiGroup User
 * @apiPermission user
 * 
 * @apiParam {String} code 微信临时登录凭证code.
 *
 * @apiSampleRequest /api/user/token
 */
router.post('/token', function(req, res) {
    let { code } = req.body;
    // 请求微信API
    let url =
        `https:/\/\api.weixin.qq.com/\sns/\jscode2session?appid=${appid}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;
    request(url, function(error, response, body) {
        if (error) {
            console.log(error);
            return;
        }
        if (response.statusCode != 200) {
            res.json({
                status: false,
                msg: response.statusMessage
            });
            return;
        }
        let data = JSON.parse(body);
        // 微信api返回错误
        if (data.errcode) {
            res.json({
                status: false,
                msg: data.errmsg
            });
            return;
        }
        // 生成token
        let token = jwt.sign(data, 'secret');
        // 查询数据库中是否有此openid
        let sql = 'SELECT * FROM user WHERE openid = ?';
        db.query(sql, [data.openid], function(results) {
            // 如果没有此openid，插入新的数据
            if (results.length == 0) {
                let sql = 'INSERT INTO user (openid,session_key) VALUES (?,?)';
                db.query(sql, [data.openid, data.session_key], function(results) {
                    if (results.affectedRows > 0) {
                        res.json({
                            status: true,
                            token: token
                        });
                    }
                });
                return;
            }
            // 如果有此openid，更新session_key的数据
            let sql = 'UPDATE user SET session_key = ? WHERE openid = ?';
            db.query(sql, [data.session_key, data.openid], function(results) {
                if (results.affectedRows > 0) {
                    res.json({
                        status: true,
                        token: token
                    });
                    return;
                }
            });
        });
    });
});
/**
 * @api {put} /api/user/info 上传微信用户信息
 * @apiName userInfoUpload
 * @apiGroup User
 * @apiPermission user
 * 
 * @apiParam { String } nickName 用户昵称.
 * @apiParam { Number } gender 性别.
 * @apiParam { String } avatarUrl 头像.
 * @apiParam { String } country 国家.
 * @apiParam { String } province 省.
 * @apiParam { String } city 市.
 *
 * @apiSampleRequest /api/user/info
 */
router.put("/info", function(req, res) {
    let { nickName, gender, avatarUrl, country, province, city } = req.body;
    let { openid } = req.user;
    let sql = `UPDATE user SET nickname = ?, sex = ?, avatar = ?, country = ?, province = ?, city = ? WHERE openid = ?`;
    db.query(sql, [nickName, gender, avatarUrl, country, province, city, openid], function(results) {
        if (results.affectedRows) {
            res.json({
                status: true,
                msg: "存储信息成功！",
            })
        }
    });
});

module.exports = router;
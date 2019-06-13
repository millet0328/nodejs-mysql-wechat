const express = require('express');
const router = express.Router();
const fs = require("fs");
const path = require("path");
// 数据库
let db = require('../config/mysql');
//文件传输
const multer = require('multer');
const upload = multer();
//图片处理
const images = require("images");
//uuid
const uuidv1 = require('uuid/v1');
// JSON Web Token
const jwt = require("jsonwebtoken");
/**
 * @apiDefine SuccessResponse
 * @apiSuccess { Boolean } status 请求状态.
 * @apiSuccess { String } msg 请求结果信息.
 * @apiSuccess { Object } data 请求结果信息.
 * @apiSuccess { String } data.token 注册成功之后返回的token.
 * @apiSuccess { String } data.id 用户uid.
 * @apiSuccess { String } data.role 用户角色id.
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
 * @api {post} /api/admin/register 管理员注册
 * @apiDescription 注册成功， 返回token, 请在头部headers中设置Authorization: `Bearer ${token}`,所有请求都必须携带token;
 * @apiName AdminRegister
 * @apiGroup admin User
 * @apiPermission admin
 *
 * @apiParam {String} username 用户账户名.
 * @apiParam {String} password 用户密码.
 * @apiParam {String} nickname 用户昵称.
 * @apiParam { String } sex 性别.
 * @apiParam { String } tel 手机号码.
 *
 * @apiUse SuccessResponse
 *
 * @apiSampleRequest /api/admin/register
 */
router.post('/admin/register', function (req, res) {
    let {username, password, nickname, sex, tel} = req.body;
    // 查询账户是否存在
    let sql = `SELECT * FROM ADMIN WHERE username = ?`
    db.query(sql, [username], function (results, fields) {
        if (results.length) {
            res.json({
                status: false,
                msg: "账号已经存在！"
            });
            return false;
        }
        let {pool} = db;
        pool.getConnection(function (err, connection) {
            if (err)
                throw err; // not connected!
            connection.beginTransaction(function (err) {
                if (err) {
                    throw err;
                }
                let sql =
                    `INSERT INTO ADMIN (username,password,nickname,sex,tel,create_time) VALUES (?,?,?,?,?,CURRENT_TIMESTAMP())`;
                connection.query(sql, [username, password, nickname, sex, tel], function (error, results, fields) {
                    let {insertId, affectedRows} = results;
                    if (error || affectedRows <= 0) {
                        return connection.rollback(function () {
                            throw error || `${affectedRows} rows changed!`;
                        });
                    }
                    let sql = `INSERT INTO admin_role (admin_id,role_id) VALUES (?,3)`;
                    connection.query(sql, [insertId], function (error, results, fields) {
                        if (error) {
                            return connection.rollback(function () {
                                throw error;
                            });
                        }
                        connection.commit(function (err) {
                            if (err) {
                                return connection.rollback(function () {
                                    throw err;
                                });
                            }
                        });
                        let payload = {
                            id: insertId,
                            username,
                            role: 3,
                        }
                        // 生成token
                        let token = jwt.sign(payload, 'secret', {expiresIn: '4h'});
                        // 存储成功
                        res.json({
                            status: true,
                            msg: "注册成功！",
                            data: {
                                token,
                                id: insertId,
                                role: 3
                            }
                        });
                    });

                });
            });
        });
    });
});

/**
 * @api {post} /api/admin/login 管理员登录
 * @apiDescription 登录成功， 返回token, 请在头部headers中设置Authorization: `Bearer ${token}`, 所有请求都必须携带token;
 * @apiName AdminLogin
 * @apiGroup admin User
 * @apiPermission admin
 *
 * @apiParam {String} username 用户账户名.
 * @apiParam {String} password 用户密码.
 *
 * @apiUse SuccessResponse
 *
 * @apiSampleRequest /api/admin/login
 */

router.post('/admin/login', function (req, res) {
    let {username, password} = req.body;
    let sql =
        `SELECT a.*,r.id AS role FROM ADMIN a LEFT JOIN admin_role ar ON a.id = ar.admin_id LEFT JOIN role r ON r.id = ar.role_id  WHERE username = ? AND password = ?`;
    db.query(sql, [username, password], function (results) {
        // 账号密码错误
        if (!results.length) {
            res.json({
                status: false,
                msg: "账号或者密码错误！"
            });
            return false;
        }
        let {id, role} = results[0];
        // 更新登陆时间，登陆次数
        let sql = `UPDATE ADMIN SET login_count = login_count + 1 WHERE id = ?;`
        db.query(sql, [results[0].id], function (response) {
            if (response.affectedRows > 0) {
                // 登录成功
                let payload = {
                    id,
                    username,
                    role,
                }
                // 生成token
                let token = jwt.sign(payload, 'secret', {expiresIn: '4h'});
                res.json({
                    status: true,
                    msg: "登录成功！",
                    data: {
                        token,
                        id,
                        role,
                    }
                });
            }
        });

    });
});
/**
 * @api {get} /api/admin/list/ 获取admin用户列表
 * @apiName AdminList
 * @apiGroup admin User
 * @apiPermission admin
 *
 * @apiSampleRequest /api/admin/list
 */
router.get("/admin/list", function (req, res) {
    //查询账户数据
    let sql =
        `SELECT a.id,a.username,a.nickname,a.sex,a.avatar,a.tel,r.role_name,r.id AS role FROM ADMIN AS a LEFT JOIN admin_role AS ar ON a.id = ar.admin_id LEFT JOIN role AS r ON r.id = ar.role_id ORDER BY a.id`;
    db.query(sql, [], function (results, fields) {
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
            data: results
        });
    })
});
/**
 * @api {post} /api/admin/delete/ 删除admin用户
 * @apiName DeleteAdmin
 * @apiGroup admin User
 * @apiPermission admin
 *
 * @apiParam {Number} uid admin用户id.
 *
 * @apiSampleRequest /api/admin/delete
 */
router.post('/admin/delete', function (req, res) {
    let {uid} = req.body;
    let sql = `DELETE FROM admin WHERE id = ?;DELETE FROM admin_role WHERE admin_id = ?;`
    db.query(sql, [uid, uid], function (results) {
        // 获取成功
        res.json({
            status: true,
            msg: "删除成功！",
        });
    })
});
/**
 * @api {get} /api/admin/info/ 获取admin个人资料
 * @apiName AdminInfo
 * @apiGroup admin User
 *
 * @apiParam {Number} uid admin用户id.
 *
 * @apiSampleRequest /api/admin/info
 */
router.get("/admin/info", function (req, res) {
    //查询账户数据
    let sql =
        `SELECT a.id,a.username,a.nickname,a.sex,a.avatar,a.tel,r.role_name,r.id AS role FROM ADMIN AS a LEFT JOIN admin_role AS ar ON a.id = ar.admin_id LEFT JOIN role AS r ON r.id = ar.role_id WHERE a.id = ?`;
    db.query(sql, [req.query.uid], function (results, fields) {
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
    })
});
/**
 * @api { post } /api/admin/info/update/ 更新admin个人资料
 * @apiName UpdateInfo
 * @apiGroup admin User
 *
 * @apiParam {Number} uid 用户id.
 * @apiParam {String} nickname 昵称.
 * @apiParam {String} sex 性别.
 * @apiParam {String} avatar 头像.
 * @apiParam { String } tel 手机号码.
 * @apiParam { String } role 用户角色id.
 *
 * @apiSampleRequest /api/admin/info/update/
 */
router.post("/admin/info/update/", function (req, res) {
    let {uid, nickname, sex, avatar, tel, role} = req.body;
    let sql =
        `
    UPDATE admin SET nickname = ?,sex = ?,avatar = ?,tel = ? WHERE id = ?;
    UPDATE admin_role SET role_id = ? WHERE admin_id = ?;
    `
    db.query(sql, [nickname, sex, avatar, tel, uid, role, uid], function (results, fields) {
        res.json({
            status: true,
            msg: "修改成功！"
        });
    });
});

/**
 * @api {get} /api/category/all/ 获取所有树形分类
 * @apiName category/all 获取所有树形分类
 * @apiGroup admin-Category
 * @apiPermission admin
 *
 * @apiSampleRequest /api/category/all/
 */
router.get("/category/all", function (req, res) {
    let sql = `SELECT * FROM CATEGORIES `;
    db.query(sql, [], function (results, fields) {
        //成功
        res.json({
            status: true,
            msg: "success!",
            data: results
        });
    });
});
/**
 * @api {post} /api/category/add/ 添加子分类
 * @apiName category/add 添加子分类
 * @apiGroup admin-Category
 * @apiPermission admin
 *
 * @apiParam {String} name 分类名称.
 * @apiParam {Number} pId 父级id.
 * @apiParam {String} img 分类图片src地址.
 * @apiParam {Number} [level] 分类所在层级.
 *
 * @apiSampleRequest /api/category/add/
 */
router.post("/category/add", function (req, res) {
    let {name, pId, level, img} = req.body;
    // 图片img为空
    if (!img) {
        res.json({
            status: false,
            msg: "请上传分类图片!",
        });
        return;
    }
    let sql = `INSERT INTO CATEGORIES (name,pId,level,img) VALUES (?,?,?,?) `;
    db.query(sql, [name, pId, level, img], function (results, fields) {
        //成功
        res.json({
            status: true,
            msg: "success!",
            data: {
                id: results.insertId
            }
        });
    });
});
/**
 * @api {post} /api/category/delete/ 删除分类
 * @apiName category/delete 删除分类
 * @apiGroup admin-Category
 * @apiPermission admin
 *
 * @apiParam {Number} id 分类id.
 *
 * @apiSampleRequest /api/category/delete/
 */
router.post("/category/delete", function (req, res) {
    let sql = `SELECT img FROM categories WHERE id = ?;DELETE FROM CATEGORIES WHERE id = ?`;
    db.query(sql, [req.body.id, req.body.id], function (results, fields) {
        let src = results[0][0].img;
        // 如果没有分类图片
        if (!src) {
            //成功
            res.json({
                status: true,
                msg: "success!"
            });
            return;
        }
        // 有分类图片
        src = '.' + results[0][0].img;
        let realPath = path.resolve(__dirname, '../public/', src);
        fs.unlink(realPath, function (err) {
            if (err) {
                return console.error(err);
            }
            //成功
            res.json({
                status: true,
                msg: "success!"
            });
        });
    });
});
/**
 * @api {post} /api/category/update/ 更新分类
 * @apiName category/update 更新分类
 * @apiGroup admin-Category
 * @apiPermission admin
 *
 * @apiParam {Number} id 分类id.
 * @apiParam {String} name 分类名称.
 * @apiParam {String} img 分类图片src地址.
 *
 * @apiSampleRequest /api/category/update/
 */
router.post("/category/update", function (req, res) {
    let sql = `UPDATE CATEGORIES SET name = ? , img = ? WHERE id = ? `;
    db.query(sql, [req.body.name, req.body.img, req.body.id], function (results, fields) {
        //成功
        res.json({
            status: true,
            msg: "success!"
        });
    });
});
/**
 * @api {get} /api/category/sub/ 获取子级分类
 * @apiName category/sub
 * @apiGroup Category
 *
 * @apiParam {Number} pId 父级分类id。注：获取一级分类pId=1;
 *
 * @apiSampleRequest /api/category/sub/
 */
router.get("/category/sub/", function (req, res) {
    let sql = `SELECT * FROM CATEGORIES WHERE pId = ? `;
    db.query(sql, [req.query.pId], function (results, fields) {
        //成功
        res.json({
            status: true,
            msg: "success!",
            data: results
        });
    });
});
/**
 * @api {post} /api/upload/goods/ 上传商品主图
 * @apiDescription 上传图片会自动检测图片质量，压缩图片，体积<2M，尺寸（300~1500），存储至goods文件夹
 * @apiName upload/goods/
 * @apiGroup admin Upload Image
 * @apiPermission admin
 *
 * @apiParam {File} file File文件对象;
 *
 * @apiSampleRequest /api/upload/goods/
 *
 * @apiSuccess {String} lgImg 返回720宽度图片地址.
 * @apiSuccess {String} mdImg 返回360宽度图片地址.
 */
router.post("/upload/goods/", upload.single('file'), function (req, res) {
    //文件类型
    var type = req.file.mimetype;
    var size = req.file.size;
    //判断是否为图片
    var reg = /^image\/\w+$/;
    var flag = reg.test(type);
    if (!flag) {
        res.status(400).json({
            status: false,
            msg: "格式错误，请选择一张图片!"
        });
        return;
    }
    //判断图片体积是否小于2M
    if (size >= 2 * 1024 * 1024) {
        res.status(400).json({
            status: false,
            msg: "图片体积太大，请压缩图片!"
        });
        return;
    }
    //判读图片尺寸
    var width = images(req.file.buffer).width();
    if (width < 300 || width > 1500) {
        res.status(400).json({
            status: false,
            msg: "图片尺寸300-1500，请重新处理!"
        });
        return;
    }
    //处理原文件名
    var originalName = req.file.originalname;
    var formate = originalName.split(".");
    //扩展名
    var extName = "." + formate[formate.length - 1];
    var filename = uuidv1();
    //储存文件夹
    var fileFolder = "/images/goods/";

    images(req.file.buffer)
        .resize(720) //缩放尺寸至720宽
        .save("public" + fileFolder + filename + "_720" + extName, {
            quality: 70 //保存图片到文件,图片质量为70
        });

    images(req.file.buffer)
        .resize(360) //缩放尺寸至360宽
        .save("public" + fileFolder + filename + "_360" + extName, {
            quality: 70 //保存图片到文件,图片质量为70
        });
    //返回储存结果
    res.json({
        status: true,
        msg: "图片上传处理成功!",
        lgImg: fileFolder + filename + "_720" + extName,
        mdImg: fileFolder + filename + "_360" + extName
    });
});
/**
 * @api {post} /api/upload/delete/ 删除图片API
 * @apiDescription如果上传错误的图片，通过此API删除错误的图片
 * @apiName upload/delete/
 * @apiGroup admin Upload Image
 * @apiPermission admin
 *
 * @apiParam {String} src 图片文件路径,注：src='./images/goods/file.jpg'，必须严格按照规范路径，'./images'不可省略;
 *
 * @apiSampleRequest /api/upload/delete/
 */

router.post('/upload/delete/', function (req, res) {
    let realPath = path.resolve(__dirname, '../public/', req.body.src);
    fs.unlink(realPath, function (err) {
        if (err) {
            return console.error(err);
        }
        res.json({
            status: true,
            msg: "success!"
        });
    })
});
/**
 * @api {post} /api/upload/slider/ 轮播图上传API
 * @apiDescription 上传图片会自动检测图片质量，压缩图片，体积<2M，尺寸（300~1500）必须是正方形，存储至goods文件夹
 * @apiName upload/slider/
 * @apiGroup admin Upload Image
 * @apiPermission admin
 *
 * @apiParam {File} file File文件对象;
 *
 * @apiSampleRequest /api/upload/slider/
 *
 * @apiSuccess {String} src 返回720宽度图片地址.
 */
router.post("/upload/slider", upload.single('file'), function (req, res) {
    //文件类型
    var type = req.file.mimetype;
    var size = req.file.size;
    //判断是否为图片
    var reg = /^image\/\w+$/;
    var flag = reg.test(type);
    if (!flag) {
        res.status(400).json({
            status: false,
            msg: "格式错误，请选择一张图片!"
        });
        return;
    }
    //判断图片体积是否小于2M
    if (size >= 2 * 1024 * 1024) {
        res.status(400).json({
            status: false,
            msg: "图片体积太大，请压缩图片!"
        });
        return;
    }
    //判读图片尺寸
    var width = images(req.file.buffer).width();
    var height = images(req.file.buffer).height();
    if (width != height) {
        res.status(400).json({
            status: false,
            msg: "图片必须为正方形，请重新上传!"
        });
        return;
    }
    if (width < 300 || width > 1500) {
        res.status(400).json({
            status: false,
            msg: "图片尺寸300-1500，请重新处理!"
        });
        return;
    }
    //处理原文件名
    var originalName = req.file.originalname;
    var formate = originalName.split(".");
    //扩展名
    var extName = "." + formate[formate.length - 1];
    var filename = uuidv1();
    //储存文件夹
    var fileFolder = "/images/goods/";
    //处理图片
    images(req.file.buffer)
        .resize(720) //缩放尺寸至720宽
        .save("public" + fileFolder + filename + "_720" + extName, {
            quality: 70 //保存图片到文件,图片质量为70
        });
    //返回储存结果
    res.json({
        status: true,
        msg: "图片上传处理成功!",
        src: fileFolder + filename + "_720" + extName
    });
});
/**
 * @api {post} /api/upload/editor/ 富文本编辑器图片上传
 * @apiDescription 上传图片会自动检测图片质量，压缩图片，体积<2M，不限制尺寸，存储至details文件夹
 * @apiName UploadEditor
 * @apiGroup admin Upload Image
 * @apiPermission admin
 *
 * @apiParam {File} file File文件对象;
 *
 * @apiSampleRequest /api/upload/editor/
 *
 * @apiSuccess {String[]} data 返回图片地址.
 */
router.post("/upload/editor", upload.single('file'), function (req, res) {
    //文件类型
    var type = req.file.mimetype;
    var size = req.file.size;
    //判断是否为图片
    var reg = /^image\/\w+$/;
    var flag = reg.test(type);
    if (!flag) {
        res.json({
            errno: 1,
            msg: "格式错误，请选择一张图片!"
        });
        return;
    }
    //判断图片体积是否小于2M
    if (size >= 2 * 1024 * 1024) {
        res.json({
            errno: 1,
            msg: "图片体积太大，请压缩图片!"
        });
        return;
    }
    //处理原文件名
    var originalName = req.file.originalname;
    var formate = originalName.split(".");
    //扩展名
    var extName = "." + formate[formate.length - 1];
    var filename = uuidv1();
    //储存文件夹
    var fileFolder = "/images/details/";
    //处理图片
    images(req.file.buffer)
        .save("public" + fileFolder + filename + extName, {
            quality: 70 //保存图片到文件,图片质量为70
        });
    //返回储存结果
    res.json({
        errno: 0,
        msg: "图片上传处理成功!",
        data: fileFolder + filename + extName
    });
});
/**
 * @api {post} /api/upload/common/ 通用图片上传API
 * @apiDescription 上传图片会自动检测图片质量，压缩图片，体积<2M，不限制尺寸，存储至common文件夹
 * @apiName UploadCommon
 * @apiGroup Upload Image
 *
 *
 * @apiParam {File} file File文件对象;
 *
 * @apiSampleRequest /api/upload/common/
 *
 * @apiSuccess {String} src 返回图片地址.
 */
router.post("/upload/common", upload.single('file'), function (req, res) {
    //文件类型
    var type = req.file.mimetype;
    var size = req.file.size;
    //判断是否为图片
    var reg = /^image\/\w+$/;
    var flag = reg.test(type);
    if (!flag) {
        res.status(400).json({
            status: false,
            msg: "格式错误，请选择一张图片!"
        });
        return;
    }
    //判断图片体积是否小于2M
    if (size >= 2 * 1024 * 1024) {
        res.status(400).json({
            status: false,
            msg: "图片体积太大，请压缩图片!"
        });
        return;
    }
    //处理原文件名
    var originalName = req.file.originalname;
    var formate = originalName.split(".");
    //扩展名
    var extName = "." + formate[formate.length - 1];
    var filename = uuidv1();
    //储存文件夹
    var fileFolder = "/images/common/";
    //处理图片
    images(req.file.buffer)
        .save("public" + fileFolder + filename + extName, {
            quality: 70 //保存图片到文件,图片质量为70
        });
    //返回储存结果
    res.json({
        status: true,
        msg: "图片上传处理成功!",
        src: fileFolder + filename + extName
    });
});
/**
 * @api {post} /api/upload/avatar/ 用户头像上传API
 * @apiDescription 上传图片会自动检测图片质量，压缩图片，体积<2M，尺寸（120~300）必须是正方形，存储至avatar文件夹
 * @apiName UploadAvatar
 * @apiGroup Upload Image
 *
 *
 * @apiParam {File} file File文件对象;
 *
 * @apiSampleRequest /api/upload/avatar/
 *
 * @apiSuccess {String} src 返回图片地址.
 */
router.post("/upload/avatar", upload.single('file'), function (req, res) {
    //文件类型
    var type = req.file.mimetype;
    var size = req.file.size;
    //判断是否为图片
    var reg = /^image\/\w+$/;
    var flag = reg.test(type);
    if (!flag) {
        res.status(400).json({
            status: false,
            msg: "格式错误，请选择一张图片!"
        });
        return;
    }
    //判断图片体积是否小于2M
    if (size >= 2 * 1024 * 1024) {
        res.status(400).json({
            status: false,
            msg: "图片体积太大，请压缩图片!"
        });
        return;
    }
    //判读图片尺寸
    var width = images(req.file.buffer).width();
    var height = images(req.file.buffer).height();
    if (width != height) {
        res.status(400).json({
            status: false,
            msg: "图片必须为正方形，请重新上传!"
        });
        return;
    }
    if (width < 120 || width > 300) {
        res.status(400).json({
            status: false,
            msg: "图片尺寸120-300，请重新处理!"
        });
        return;
    }
    //处理原文件名
    var originalName = req.file.originalname;
    var formate = originalName.split(".");
    //扩展名
    var extName = "." + formate[formate.length - 1];
    var filename = uuidv1();
    //储存文件夹
    var fileFolder = "/images/avatar/";
    //处理图片
    images(req.file.buffer)
        .save("public" + fileFolder + filename + extName, {
            quality: 70 //保存图片到文件,图片质量为70
        });
    //返回储存结果
    res.json({
        status: true,
        msg: "图片上传处理成功!",
        src: fileFolder + filename + extName
    });
});

/**
 * @api {post} /api/goods/release/ 发布新商品
 * @apiName goods/release/
 * @apiGroup admin Goods
 * @apiPermission admin
 *
 * @apiParam {Number} cate_1st 一级分类id;
 * @apiParam {Number} cate_2nd 二级分类id;
 * @apiParam {Number} [cate_3rd] 三级分类id;
 * @apiParam {String} name 商品名称;
 * @apiParam {String} [hotPoint] 商品热点描述;
 * @apiParam {Number} price 商品价格;
 * @apiParam {Number} marketPrice 市场价;
 * @apiParam {Number} cost 成本价;
 * @apiParam {Number} discount 折扣如：75%;
 * @apiParam {Number} inventory 商品库存;
 * @apiParam {String} articleNo 商品货号;
 * @apiParam {String} img_lg 商品主图-720;
 * @apiParam {String} img_md 商品主图-360;
 * @apiParam {String} slider 商品轮播图片，例：slider:'src1,src2,src3';
 * @apiParam {String} [brand] 商品品牌;
 * @apiParam {String} detail 商品详情,一般存储为HTML代码;
 * @apiParam {Number} freight 商品运费;
 *
 * @apiSampleRequest /api/goods/release/
 */
router.post("/goods/release", function (req, res) {
    let sql =
        `INSERT INTO GOODS (cate_1st,cate_2nd,cate_3rd,name,hotPoint,price,marketPrice,cost,discount,inventory,articleNo,img_lg,img_md,slider,brand,detail,freight,create_time) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP()) `;
    db.query(sql, [req.body.cate_1st, req.body.cate_2nd, req.body.cate_3rd, req.body.name, req.body.hotPoint, req.body.price,
        req.body.marketPrice, req.body.cost, req.body.discount, req.body.inventory, req.body.articleNo, req.body.img_lg,
        req.body.img_md, req.body.slider, req.body.brand, req.body.detail, req.body.freight
    ], function (results, fields) {
        //成功
        res.json({
            status: true,
            msg: "success!",
            data: {
                id: results.insertId
            }
        });
    });
});
/**
 * @api {post} /api/goods/edit/ 编辑商品
 * @apiName goods/edit/
 * @apiGroup admin Goods
 * @apiPermission admin
 *
 * @apiParam {Number} id 商品id;
 * @apiParam {Number} cate_1st 一级分类id;
 * @apiParam {Number} cate_2nd 二级分类id;
 * @apiParam {Number} [cate_3rd] 三级分类id;
 * @apiParam {String} name 商品名称;
 * @apiParam {String} [hotPoint] 商品热点描述;
 * @apiParam {Number} price 商品价格;
 * @apiParam {Number} marketPrice 市场价;
 * @apiParam {Number} cost 成本价;
 * @apiParam {Number} discount 折扣如：75%;
 * @apiParam {Number} inventory 商品库存;
 * @apiParam {String} articleNo 商品货号;
 * @apiParam {String} img_lg 商品主图-720;
 * @apiParam {String} img_md 商品主图-360;
 * @apiParam {String} slider 商品轮播图片，例：slider:'src1,src2,src3';
 * @apiParam {String} [brand] 商品品牌;
 * @apiParam {String} detail 商品详情,一般存储为HTML代码;
 * @apiParam {Number} freight 商品运费;
 *
 * @apiSampleRequest /api/goods/edit/
 */
router.post("/goods/edit", function (req, res) {
    let sql =
        `UPDATE GOODS SET cate_1st=?,cate_2nd=?,cate_3rd=?,name=?,hotPoint=?,price=?,marketPrice=?,cost=?,discount=?,inventory=?,articleNo=?,img_lg=?,img_md=?,slider=?,brand=?,detail=?,freight=?,update_time = CURRENT_TIMESTAMP() WHERE id=?`;
    db.query(sql, [req.body.cate_1st, req.body.cate_2nd, req.body.cate_3rd, req.body.name, req.body.hotPoint, req.body.price,
        req.body.marketPrice, req.body.cost, req.body.discount, req.body.inventory, req.body.articleNo, req.body.img_lg,
        req.body.img_md, req.body.slider, req.body.brand, req.body.detail, req.body.freight, req.body.id
    ], function (results, fields) {
        //成功
        res.json({
            status: true,
            msg: "success!",
            data: results[0]
        });
    });
});
/**
 * @api {get} /api/admin/goods/list 获取商品列表
 * @apiDescription 具备商品分页功能，3个分类参数至多能传1个
 * @apiName AdminGoodsList 获取商品列表
 * @apiGroup admin Goods
 * @apiPermission admin
 *
 * @apiParam {Number} [pageSize] 一个页有多少个商品,默认4个;
 * @apiParam {Number} [pageIndex] 第几页,默认1;
 * @apiParam {Number} [cate_1st] 一级分类id;
 * @apiParam {Number} [cate_2nd] 二级分类id;
 * @apiParam {Number} [cate_3rd] 三级分类id;
 * @apiParam {String="ASC","DESC"} [sortByPrice] 按照价格排序，从小到大-ASC,从大到小-DESC;
 * @apiSampleRequest /api/admin/goods/list
 */
router.get("/admin/goods/list", function (req, res) {
    let query = req.query;
    //取出空键值对
    for (let key in query) {
        if (!query[key]) {
            delete query[key]
        }
    }

    //拼接SQL
    function produceSQL({pageSize = 4, pageIndex = 1, sortByPrice = '', cate_1st = '', cate_2nd = '', cate_3rd = '',}) {
        let size = parseInt(pageSize);
        let count = size * (pageIndex - 1);
        let sql = `SELECT id,name,price,img_md,articleNo,inventory,create_time FROM GOODS`
        if (cate_1st) {
            sql += `WHERE cate_1st = ${cate_1st}`;
        }
        if (cate_2nd) {
            sql += `WHERE cate_2nd = ${cate_2nd}`;
        }
        if (cate_3rd) {
            sql += `WHERE cate_3rd = ${cate_3rd}`;
        }
        sql += ` ORDER BY price ${sortByPrice},create_time DESC LIMIT ${count},${size}`
        return sql;
    }

    db.query(produceSQL(req.query), [], function (results, fields) {
        //成功
        res.json({
            status: true,
            msg: "success!",
            data: results
        });
    });
});
/**
 * @api {get} /api/admin/goods/detail/ 获取商品详情
 * @apiName GoodsDetail
 * @apiGroup admin Goods
 *
 * @apiParam {Number} id 商品id;
 *
 * @apiSampleRequest /api/admin/goods/detail/
 */
router.get("/admin/goods/detail/", function (req, res) {
    let sql = `SELECT * FROM GOODS WHERE id = ?`
    db.query(sql, [req.query.id], function (results, fields) {
        //成功
        res.json({
            status: true,
            msg: "success!",
            data: results[0]
        });
    });
});
/**
 * @api {post} /api/goods/delete/ 删除商品
 * @apiName goods/delete/
 * @apiGroup admin Goods
 * @apiPermission admin
 *
 * @apiParam {Number} id 商品id;
 *
 * @apiSampleRequest /api/goods/delete/
 */
router.post("/goods/delete", function (req, res) {
    let sql = `DELETE FROM GOODS WHERE id=?`;
    db.query(sql, [req.body.id], function (results, fields) {
        //成功
        res.json({
            status: true,
            msg: "success!",
            data: results[0]
        });
    });
});
/**
 * @api {post} /api/admin/order/list/ 获取所有账户订单列表
 * @apiDescription 获取系统中的订单列表，根据订单状态获取列表，具备分页功能
 * @apiName AdminOrderList
 * @apiGroup admin Order
 *
 * @apiParam {Number} [pageSize] 一个页有多少个商品,默认4个;
 * @apiParam {Number} [pageIndex] 第几页,默认1;
 * @apiParam {Number=0,3,4,5,all} status 订单状态:0-待付款，3-待发货，4-待收货，5-待评价，all-所有状态;
 *
 * @apiSampleRequest /api/admin/order/list/
 */
router.post('/admin/order/list/', function (req, res) {
    let {pageSize = 4, pageIndex = 1, status = 'all', id} = req.body;
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

const express = require('express');
const router = express.Router();
//文件传输
const multer = require('multer');
const upload = multer();
//图片处理
const images = require("images");
//uuid
const uuidv1 = require('uuid/v1');

/**
 * @api {post} /api/upload/goods 上传商品主图
 * @apiDescription 上传图片会自动检测图片质量，压缩图片，体积<2M，尺寸（300~1500），存储至goods文件夹
 * @apiName uploadGoods
 * @apiGroup admin Upload Image
 * @apiPermission admin
 *
 * @apiParam {File} file File文件对象;
 *
 * @apiSampleRequest /api/upload/goods
 *
 * @apiSuccess {String} lgImg 返回720宽度图片地址.
 * @apiSuccess {String} mdImg 返回360宽度图片地址.
 */
router.post("/goods", upload.single('file'), function (req, res) {
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
 * @api {post} /api/upload/slider 轮播图上传API
 * @apiDescription 上传图片会自动检测图片质量，压缩图片，体积<2M，尺寸（300~1500）必须是正方形，存储至goods文件夹
 * @apiName uploadSlider
 * @apiGroup admin Upload Image
 * @apiPermission admin
 *
 * @apiParam {File} file File文件对象;
 *
 * @apiSampleRequest /api/upload/slider
 *
 * @apiSuccess {String} src 返回720宽度图片地址.
 */
router.post("/slider", upload.single('file'), function (req, res) {
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
 * @api {post} /api/upload/editor 富文本编辑器图片上传
 * @apiDescription 上传图片会自动检测图片质量，压缩图片，体积<2M，不限制尺寸，存储至details文件夹
 * @apiName UploadEditor
 * @apiGroup admin Upload Image
 * @apiPermission admin
 *
 * @apiParam {File} file File文件对象;
 *
 * @apiSampleRequest /api/upload/editor
 *
 * @apiSuccess {String[]} data 返回图片地址.
 */
router.post("/editor", upload.single('file'), function (req, res) {
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
 * @api {post} /api/upload/avatar 用户头像上传API
 * @apiDescription 上传图片会自动检测图片质量，压缩图片，体积<2M，尺寸（120~300）必须是正方形，存储至avatar文件夹
 * @apiName UploadAvatar
 * @apiGroup admin Upload Image
 *
 *
 * @apiParam {File} file File文件对象;
 *
 * @apiSampleRequest /api/upload/avatar
 *
 * @apiSuccess {String} src 返回图片地址.
 */
router.post("/avatar", upload.single('file'), function (req, res) {
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

module.exports = router;
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
 * @api {post} /api/upload/common 通用图片上传API
 * @apiDescription 上传图片会自动检测图片质量，压缩图片，体积<2M，不限制尺寸，存储至common文件夹
 * @apiName UploadCommon
 * @apiGroup Upload Image
 *
 * @apiParam {File} file File文件对象;
 *
 * @apiSampleRequest /api/upload/common
 *
 * @apiSuccess {String} src 返回图片地址.
 */
router.post("/common", upload.single('file'), function (req, res) {
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

module.exports = router;
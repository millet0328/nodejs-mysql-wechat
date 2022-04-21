const express = require('express');
const router = express.Router();
// 文件模块
const fs = require('fs');
// 文件路径
const path = require('path');
//文件传输
const multer = require('multer');
const upload = multer();
//图片处理
const sharp = require('sharp');
//uuid
const { v4: uuidv4 } = require('uuid');

/**
 * @apiDefine Authorization
 * @apiHeader {String} Authorization 需在请求headers中设置Authorization: `Bearer ${token}`，小程序登录成功code换取的token。
 */

/**
 * @api {post} /upload/common 通用图片上传API
 * @apiDescription 上传图片会自动检测图片质量，压缩图片，体积<2M，avatar存储至avatar文件夹,common存储至common文件夹，type=avatar图片必须是正方形，type=common不限制尺寸。
 * @apiName uploadCommon
 * @apiGroup Upload
 * @apiPermission user admin
 *
 * @apiUse Authorization
 *
 * @apiBody {File} file File文件对象;
 * @apiBody {String="common","avatar"} type 上传类型：avatar--头像上传；common--通用上传；
 * 
 * @apiSampleRequest /upload/common
 * 
 * @apiSuccess {String} src 返回图片地址.
 */
router.post("/common", upload.single('file'), async function(req, res) {
	//上传类型
	let { type } = req.body;
	//文件类型
	let { mimetype, size } = req.file;
	//判断是否为图片
	var reg = /^image\/\w+$/;
	var flag = reg.test(mimetype);
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
	// 获取图片信息
	var { width, height, format } = await sharp(req.file.buffer).metadata();
	// 判断图片尺寸
	if (type == "avatar" && width != height) {
		res.status(400).json({
			status: false,
			msg: "图片必须为正方形，请重新上传!"
		});
		return;
	}
	// 生成文件名
	var filename = uuidv4();
	//储存文件夹
	var fileFolder = `/images/${type}/`;
	//处理图片
	try {
		await sharp(req.file.buffer).toFile("public" + fileFolder + filename + '.' + format);
		//返回储存结果
		res.json({
			status: true,
			msg: "图片上传处理成功!",
			src: process.env.server + fileFolder + filename + '.' + format
		});
	} catch (error) {
		res.json({
			status: false,
			msg: error,
		});
	}
});

/**
 * @api {delete} /upload 删除图片API
 * @apiDescription 如果上传错误的图片，通过此API删除错误的图片
 * @apiName uploadDelete
 * @apiGroup Upload
 * @apiPermission user admin
 *
 * @apiUse Authorization
 *
 * @apiQuery {String} src 图片文件路径,注意图片路径必须是绝对路径，例：http://localhost:3003/images/path/to/photo.jpg
 *
 * @apiExample {js} 参数示例:
 * /upload?src=http://localhost:3003/images/path/to/photo.jpg
 *
 * @apiSampleRequest /upload
 */

router.delete('/', function(req, res) {
	let { src } = req.query;
	// 判断是否是默认头像
	let isDefault = src.includes('/avatar/default.jpg');
	if (isDefault) {
		res.json({
			status: false,
			msg: "默认头像不可删除!"
		});
		return;
	}
	
	src = src.replace(/.+\/images/, "./images");
	let realPath = path.resolve(__dirname, '../../public/', src);
	fs.unlink(realPath, function(err) {
		if (err) throw err;
		res.json({
			status: true,
			msg: "success!"
		});
	})
});
module.exports = router;

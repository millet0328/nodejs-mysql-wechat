const express = require('express');
const router = express.Router();
//文件传输
const multer = require('multer');
const upload = multer();
//图片处理
const sharp = require('sharp');
//uuid
const { v4: uuidv4 } = require('uuid');

/**
 * @apiDefine Authorization
 * @apiHeader {String} Authorization 需在请求headers中设置Authorization: `Bearer ${token}`，登录/注册成功返回的token。
 */

/**
 * @api {post} /upload/goods 上传商品主图
 * @apiDescription 上传图片会自动检测图片质量，压缩图片，体积<2M，尺寸（300~1500），存储至goods文件夹
 * @apiName uploadGoods
 * @apiGroup Upload
 * @apiPermission admin
 *
 * @apiUse Authorization
 *
 * @apiBody {File} file File文件对象;
 *
 * @apiSampleRequest /upload/goods
 *
 * @apiSuccess {String} lgImg 返回720宽度图片地址.
 * @apiSuccess {String} mdImg 返回360宽度图片地址.
 */
router.post("/goods", upload.single('file'), async function(req, res) {
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
	var { width, format } = await sharp(req.file.buffer).metadata();
	// 判读图片尺寸
	if (width < 300 || width > 1500) {
		res.status(400).json({
			status: false,
			msg: "图片尺寸300-1500，请重新处理!"
		});
		return;
	}
	// 生成文件名
	var filename = uuidv4();
	// 储存文件夹
	var fileFolder = "/images/goods/";
	//处理图片
	try {
		await sharp(req.file.buffer)
			.resize(720)
			.toFile("public" + fileFolder + filename + '_720.' + format);
		await sharp(req.file.buffer)
			.resize(360)
			.toFile("public" + fileFolder + filename + '_360.' + format);
		//返回储存结果
		res.json({
			status: true,
			msg: "图片上传处理成功!",
			lgImg: process.env.server + fileFolder + filename + '_720.' + format,
			mdImg: process.env.server + fileFolder + filename + '_360.' + format,
		});
	} catch (error) {
		res.json({
			status: false,
			msg: error,
		});
	}
});

/**
 * @api {post} /upload/slider 轮播图上传API
 * @apiDescription 上传图片会自动检测图片质量，压缩图片，体积<2M，尺寸（300~1500）必须是正方形，存储至goods文件夹
 * @apiName uploadSlider
 * @apiGroup Upload
 * @apiPermission admin
 *
 * @apiUse Authorization
 *
 * @apiBody {File} file File文件对象;
 *
 * @apiSampleRequest /upload/slider
 *
 * @apiSuccess {String} src 返回720宽度图片地址.
 */
router.post("/slider", upload.single('file'), async function(req, res) {
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
	// 生成文件名
	var filename = uuidv4();
	// 储存文件夹
	var fileFolder = "/images/goods/";
	// 处理图片
	try {
		await sharp(req.file.buffer)
			.resize(720)
			.toFile("public" + fileFolder + filename + '_720.' + format);
		//返回储存结果
		res.json({
			status: true,
			msg: "图片上传处理成功!",
			src: process.env.server + fileFolder + filename + '_720.' + format,
		});
	} catch (error) {
		res.json({
			status: false,
			msg: error,
		});
	}
});
/**
 * @api {post} /upload/editor 富文本编辑器图片上传
 * @apiDescription 上传图片会自动检测图片质量，压缩图片，体积<2M，不限制尺寸，存储至details文件夹
 * @apiName UploadEditor
 * @apiGroup Upload
 * @apiPermission admin
 *
 * @apiUse Authorization
 *
 * @apiBody {File} file File文件对象;
 *
 * @apiSampleRequest /upload/editor
 *
 * @apiSuccess {String[]} data 返回图片地址.
 */
router.post("/editor", upload.single('file'), async function(req, res) {
	//文件类型
	let { mimetype, size } = req.file;
	//判断是否为图片
	var reg = /^image\/\w+$/;
	var flag = reg.test(mimetype);
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
	//扩展名
	var { format } = await sharp(req.file.buffer).metadata();
	// 生成文件名
	var filename = uuidv4();
	//储存文件夹
	var fileFolder = "/images/details/";
	//处理图片
	try {
		await sharp(req.file.buffer).toFile("public" + fileFolder + filename + '.' + format);
		//返回储存结果
		res.json({
			errno: 0,
			msg: "图片上传处理成功!",
			data: {
				url: process.env.server + fileFolder + filename + '.' + format,
			},
		});
	} catch (error) {
		res.json({
			errno: 1,
			msg: error,
		});
	}
});

module.exports = router;

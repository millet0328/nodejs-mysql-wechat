var express = require('express');
var router = express.Router();
var fs = require("fs");
var path = require("path");
// 数据库
let db = require('../config/mysql');
//文件传输
var multer = require('multer');
var upload = multer();
//图片处理
var images = require("images");
//uuid
var uuidv1 = require('uuid/v1');
/**
 * @api {get} /api/category/all/ 获取所有树形分类
 * @apiName category/all 获取所有树形分类
 * @apiGroup Category
 * 
 * @apiSampleRequest /api/category/all/
 */
router.get("/category/all", function(req, res) {
  let sql = `SELECT * FROM CATEGORIES `;
  db.query(sql, [], function(results, fields) {
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
 * @apiGroup Category
 * 
 * @apiParam {String} name 分类名称.
 * @apiParam {Number} pId 父级id.
 * @apiParam {String} img 分类图片src地址.
 * @apiParam {Number} [level] 分类所在层级.
 * 
 * @apiSampleRequest /api/category/add/
 */
router.post("/category/add", function(req, res) {
  let sql = `INSERT INTO CATEGORIES (name,pId,level,img) VALUES (?,?,?,?) `;
  db.query(sql, [req.body.name, req.body.pId, req.body.level, req.body.img], function(results, fields) {
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
 * @apiGroup Category
 * 
 * @apiParam {Number} id 分类id.
 * 
 * @apiSampleRequest /api/category/delete/
 */
router.post("/category/delete", function(req, res) {
  let sql = `
	SELECT img FROM categories WHERE id = ?;
	DELETE FROM CATEGORIES WHERE id = ?`;
  db.query(sql, [req.body.id, req.body.id], function(results, fields) {
    let src = '.' + results[0][0].img;
    let realPath = path.resolve(__dirname, '../public/', src);
    fs.unlink(realPath, function(err) {
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
 * @apiGroup Category
 * 
 * @apiParam {Number} id 分类id.
 * @apiParam {String} name 分类名称.
 * @apiParam {String} img 分类图片src地址.
 * 
 * @apiSampleRequest /api/category/update/
 */
router.post("/category/update", function(req, res) {
  let sql = `UPDATE CATEGORIES SET name = ? , img = ? WHERE id = ? `;
  db.query(sql, [req.body.name, req.body.img, req.body.id], function(results, fields) {
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
router.get("/category/sub/", function(req, res) {
  let sql = `SELECT * FROM CATEGORIES WHERE pId = ? `;
  db.query(sql, [req.query.pId], function(results, fields) {
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
 * @apiGroup Upload Image
 * 
 * @apiParam {File} file File文件对象;
 * 
 * @apiSampleRequest /api/upload/goods/
 * 
 * @apiSuccess {String} lgImg 返回720宽度图片地址.
 * @apiSuccess {String} mdImg 返回360宽度图片地址.
 */
router.post("/upload/goods/", upload.single('file'), function(req, res) {
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
 * @apiGroup Upload Image
 * 
 * @apiParam {String} src 图片文件路径,注：src='./images/goods/file.jpg'，必须严格按照规范路径，'./images'不可省略;
 * 
 * @apiSampleRequest /api/upload/delete/
 */

router.post('/upload/delete/', function(req, res) {
  let realPath = path.resolve(__dirname, '../public/', req.body.src);
  fs.unlink(realPath, function(err) {
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
 * @apiGroup Upload Image
 * 
 * @apiParam {File} file File文件对象;
 * 
 * @apiSampleRequest /api/upload/slider/
 * 
 * @apiSuccess {String} src 返回720宽度图片地址.
 */
router.post("/upload/slider", upload.single('file'), function(req, res) {
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
 * @api {post} /api/upload/common/ 通用图片上传API
 * @apiDescription 上传图片会自动检测图片质量，压缩图片，体积<2M，不限制尺寸，存储至details文件夹
 * @apiName upload/common/
 * @apiGroup Upload Image
 * 
 * @apiParam {File} file File文件对象;
 * 
 * @apiSampleRequest /api/upload/common/
 * 
 * @apiSuccess {String[]} data 返回图片地址.
 */
router.post("/upload/common", upload.single('file'), function(req, res) {
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
    data: [fileFolder + filename + extName]
  });
});

/**
 * @api {post} /api/goods/release/ 发布新商品
 * @apiName goods/release/
 * @apiGroup Goods
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
router.post("/goods/release", function(req, res) {
  let sql = `INSERT INTO GOODS (cate_1st,cate_2nd,cate_3rd,name,hotPoint,price,marketPrice,cost,discount,inventory,articleNo,img_lg,img_md,slider,brand,detail,freight,create_time) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP()) `;
  db.query(sql, [req.body.cate_1st, req.body.cate_2nd, req.body.cate_3rd, req.body.name, req.body.hotPoint, req.body.price, req.body.marketPrice, req.body.cost, req.body.discount, req.body.inventory, req.body.articleNo, req.body.img_lg, req.body.img_md, req.body.slider, req.body.brand, req.body.detail, req.body.freight], function(results, fields) {
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
 * @apiGroup Goods
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
router.post("/goods/edit", function(req, res) {
  let sql = `UPDATE GOODS SET cate_1st=?,cate_2nd=?,cate_3rd=?,name=?,hotPoint=?,price=?,marketPrice=?,cost=?,discount=?,inventory=?,articleNo=?,img_lg=?,img_md=?,slider=?,brand=?,detail=?,freight=?,update_time = CURRENT_TIMESTAMP() WHERE id=?`;
  db.query(sql, [req.body.cate_1st, req.body.cate_2nd, req.body.cate_3rd, req.body.name, req.body.hotPoint, req.body.price, req.body.marketPrice, req.body.cost, req.body.discount, req.body.inventory, req.body.articleNo, req.body.img_lg, req.body.img_md, req.body.slider, req.body.brand, req.body.detail, req.body.freight, req.body.id], function(results, fields) {
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
 * @apiGroup Goods
 * 
 * @apiParam {Number} id 商品id;
 * 
 * @apiSampleRequest /api/goods/delete/
 */
router.post("/goods/delete", function(req, res) {
  let sql = `DELETE FROM GOODS WHERE id=?`;
  db.query(sql, [req.body.id], function(results, fields) {
    //成功
    res.json({
      status: true,
      msg: "success!",
      data: results[0]
    });
  });
});

module.exports = router;
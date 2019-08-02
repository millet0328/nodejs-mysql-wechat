const express = require('express');
const router = express.Router();
// 数据库
let db = require('../../config/mysql');
const fs = require("fs");
const path = require("path");
/**
 * @api {get} /api/category/all 获取所有树形分类
 * @apiName allCategory
 * @apiGroup admin-Category
 * @apiPermission admin
 *
 * @apiSampleRequest /api/category/all
 */
router.get("/all", function (req, res) {
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
 * @api {post} /api/category/add 添加子分类
 * @apiName category/add 添加子分类
 * @apiGroup admin-Category
 * @apiPermission admin
 *
 * @apiParam {String} name 分类名称.
 * @apiParam {Number} pId 父级id.
 * @apiParam {String} img 分类图片src地址.
 * @apiParam {Number} [level] 分类所在层级.
 *
 * @apiSampleRequest /api/category/add
 */
router.post("/add", function (req, res) {
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
 * @api {delete} /api/category 删除分类
 * @apiName category/delete 删除分类
 * @apiGroup admin-Category
 * @apiPermission admin
 *
 * @apiParam {Number} id 分类id.
 *
 * @apiSampleRequest /api/category
 */
router.delete("/", function (req, res) {
    let {id} = req.body;
    let sql = `SELECT img FROM categories WHERE id = ?;DELETE FROM CATEGORIES WHERE id = ?`;
    db.query(sql, [id, id], function (results, fields) {
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
 * @api {put} /api/category 更新分类
 * @apiName updateCategory
 * @apiGroup admin-Category
 * @apiPermission admin
 *
 * @apiParam {Number} id 分类id.
 * @apiParam {String} name 分类名称.
 * @apiParam {String} img 分类图片src地址.
 *
 * @apiSampleRequest /api/category
 */
router.put("/", function (req, res) {
    let {id, name, img} = req.body;
    let sql = `UPDATE CATEGORIES SET name = ? , img = ? WHERE id = ? `;
    db.query(sql, [name, img, id], function (results, fields) {
        //成功
        res.json({
            status: true,
            msg: "success!"
        });
    });
});
/**
 * @api {get} /api/category/sub 获取子级分类
 * @apiName category/sub
 * @apiGroup Category
 *
 * @apiParam {Number} pId 父级分类id。注：获取一级分类pId=1;
 *
 * @apiSampleRequest /api/category/sub
 */
router.get("/sub", function (req, res) {
    let { pId } = req.body;
    let sql = `SELECT * FROM CATEGORIES WHERE pId = ? `;
    db.query(sql, [pId], function (results, fields) {
        //成功
        res.json({
            status: true,
            msg: "success!",
            data: results
        });
    });
});

module.exports = router;
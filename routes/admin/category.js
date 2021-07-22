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
    let sql = `SELECT * FROM CATEGORY `;
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
 * @api {post} /api/category 添加子分类
 * @apiName categoryAdd
 * @apiGroup admin-Category
 * @apiPermission admin
 *
 * @apiParam {String} name 分类名称.
 * @apiParam {Number} pId 父级id.
 * @apiParam {String} img 分类图片src地址.
 * @apiParam {Number} [level] 分类所在层级.
 *
 * @apiSampleRequest /api/category
 */
router.post("/", function (req, res) {
    let { name, pId, level, img } = req.body;
    let sql = `INSERT INTO CATEGORY (name,pId,level,img) VALUES (?,?,?,?) `;
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
 * @api {delete} /api/category/:id 删除分类
 * @apiName categoryDelete
 * @apiGroup admin-Category
 * @apiPermission admin
 *
 * @apiParam {Number} id 分类id.
 *
 * @apiExample {js} 参数示例:
 * /api/category/3
 *
 * @apiSampleRequest /api/category
 */
router.delete("/:id", function (req, res) {
    let { id } = req.params;
    let checkSQL = 'SELECT * FROM category WHERE pId = ?';
    db.query(checkSQL, [id], function (results, fields) {
        if (results.length > 0) {
            res.json({
                status: false,
                msg: "拥有子级分类，不允许删除！"
            });
            return;
        }
        let sql = `SELECT img FROM category WHERE id = ?;DELETE FROM CATEGORY WHERE id = ?`;
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
            src = src.replace(/.+\/images/, "./images");
            let realPath = path.resolve(__dirname, '../../public/', src);
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
});
/**
 * @api {put} /api/category/:id 更新分类
 * @apiName updateCategory
 * @apiGroup admin-Category
 * @apiPermission admin
 *
 * @apiParam {Number} id 分类id.
 * @apiParam {String} name 分类名称.
 * @apiParam {String} img 分类图片src地址.
 *
 * @apiExample {js} 参数示例:
 * /api/category/3
 *
 * @apiSampleRequest /api/category
 */
router.put("/:id", function (req, res) {
    let { id } = req.params;
    let { name, img } = req.body;
    let sql = `UPDATE CATEGORY SET name = ? , img = ? WHERE id = ? `;
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
 * @apiName categorySub
 * @apiGroup Category
 * @apiPermission admin user
 *
 * @apiParam {Number} pId 父级分类id。注：获取一级分类pId = 1，获取根分类pId = 0;
 *
 * @apiSampleRequest /api/category/sub
 */
router.get("/sub", function (req, res) {
    let { pId } = req.query;
    let sql = `SELECT * FROM CATEGORY WHERE pId = ? `;
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
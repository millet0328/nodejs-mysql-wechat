const express = require('express');
const router = express.Router();
// 数据库
let db = require('../../config/mysql');

/**
 * @api {post} /api/menu 添加子菜单
 * @apiName MenuAdd
 * @apiGroup admin-Menu
 * @apiPermission admin
 *
 * @apiParam {String} name 分类名称.
 * @apiParam {String} component 关联组件名称.
 * @apiParam {Number} pId 父级id.
 * @apiParam {String} path 菜单url地址.
 * @apiParam {String} menu_order 菜单显示顺序，按照数字从小到大排序，如2001.
 *
 * @apiSampleRequest /api/menu
 */
router.post("/", function (req, res) {
    let { name, pId, component, path, menu_order } = req.body;
    let sql = `INSERT INTO MENU (name,pId,component,path,menu_order) VALUES (?,?,?,?,?) `;
    db.query(sql, [name, pId, component, path, menu_order], function ({ insertId }, fields) {
        let sql = `INSERT INTO role_menu (role_id,menu_id) VALUES (1,?)`;
        db.query(sql, [insertId], function (results, fields) {
            if (!results.affectedRows) {
                res.json({
                    status: false,
                    msg: "创建失败！"
                });
                return;
            }
            //成功
            res.json({
                status: true,
                msg: "创建成功!",
                data: {
                    id: insertId
                }
            });
        })

    });
});
/**
 * @api {delete} /api/menu/:id 删除子菜单
 * @apiName MenuDelete
 * @apiGroup admin-Menu
 * @apiPermission admin
 *
 * @apiParam {Number} id 子菜单id.
 *
 * @apiExample {js} 参数示例:
 * /api/menu/3
 *
 * @apiSampleRequest /api/menu
 */
router.delete("/:id", function (req, res) {
    let { id } = req.params;
    let checkSQL = 'SELECT * FROM MENU WHERE pId = ?';
    db.query(checkSQL, [id], function (results, fields) {
        if (results.length > 0) {
            res.json({
                status: false,
                msg: "拥有子级分类，不允许删除！"
            });
            return;
        }
        let sql = `DELETE FROM MENU WHERE id = ?;DELETE FROM ROLE_MENU WHERE menu_id = ?`;
        db.query(sql, [id, id], function (results, fields) {
            if (!results[1].affectedRows) {
                res.json({
                    status: false,
                    msg: "删除失败！"
                });
                return;
            }
            //成功
            res.json({
                status: true,
                msg: "删除成功!"
            });
        });
    });
});
/**
 * @api {put} /api/menu/:id 更新子菜单
 * @apiName MenuUpdate
 * @apiGroup admin-Menu
 * @apiPermission admin
 *
 * @apiParam {Number} id 子菜单id.
 * @apiParam {String} name 分类名称.
 * @apiParam {String} component 关联组件名称.
 * @apiParam {Number} pId 父级id.
 * @apiParam {String} path 菜单url地址.
 * @apiParam {String} menu_order 菜单显示顺序，按照数字从小到大排序，如2001.
 *
 * @apiExample {js} 参数示例:
 * /api/menu/3
 *
 * @apiSampleRequest /api/menu
 */
router.put("/:id", function (req, res) {
    let { id } = req.params;
    let { name, pId, component, path, menu_order } = req.body;
    let sql = `UPDATE MENU SET name = ?,pId = ?,component = ?, path = ?, menu_order = ? WHERE id = ? `;
    db.query(sql, [name, pId, component, path, menu_order, id], function (results, fields) {
        if (!results.affectedRows) {
            res.json({
                status: false,
                msg: "failed！"
            });
            return;
        }
        //成功
        res.json({
            status: true,
            msg: "success!"
        });
    });
});
/**
 * @api {put} /api/menu/icon 设置子菜单图标
 * @apiName MenuUpdateIcon
 * @apiGroup admin-Menu
 * @apiPermission admin
 *
 * @apiParam { Number } id 子菜单id.
 * @apiParam { String } icon_id element图标id.
 *
 * @apiExample {js} 参数示例:
 * /api/menu/icon/3
 *
 * @apiSampleRequest /api/menu/icon
 */
router.put("/icon/:id", function (req, res) {
    let { id } = req.params;
    let { icon_id } = req.body;
    let sql = `UPDATE MENU SET icon_id = ? WHERE id = ? `;
    db.query(sql, [icon_id, id], function (results, fields) {
        if (!results.affectedRows) {
            res.json({
                status: false,
                msg: "failed！"
            });
            return;
        }
        //成功
        res.json({
            status: true,
            msg: "success!"
        });
    });
});
/**
 * @api {get} /api/menu/sub 获取子菜单
 * @apiName MenuSub
 * @apiGroup admin-Menu
 * @apiPermission admin
 *
 * @apiParam { Number } pId 父级菜单id。 注： 获取一级菜单pId = 1;
 *
 * @apiSampleRequest /api/menu/sub
 */
router.get("/sub", function (req, res) {
    let sql =
        `SELECT m.*, i.name AS 'icon' FROM MENU m LEFT JOIN ICON i ON m.icon_id = i.id WHERE m.pId = ? ORDER BY m.menu_order`;
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
 * @api {get} /api/menu/tree 根据角色id获取侧边栏树形菜单
 * @apiName TreeMenu
 * @apiGroup admin-Menu
 * @apiPermission admin
 *
 * @apiParam {Number} id 角色id.
 *
 * @apiSampleRequest /api/menu/tree
 */
router.get('/tree', function (req, res) {
    let { id } = req.query;
    let sql =
        `SELECT m.*,i.name AS 'icon' FROM MENU m JOIN role_menu rm ON rm.menu_id = m.id LEFT JOIN ICON i ON m.icon_id = i.id WHERE rm.role_id = ? ORDER BY m.menu_order;`;
    db.query(sql, [id], function (results) {
        // //筛选出一级菜单
        // let cate_1st = results.filter((item) => item.pId === 1 ? item : null);
        // //递归循环数据
        // parseToTree(cate_1st);
        //
        // //递归函数
        // function parseToTree(array) {
        //     array.forEach(function (parent) {
        //         parent.children = [];
        //         results.forEach(function (child) {
        //             if (child.pId === parent.id) {
        //                 parent.children.push(child);
        //             }
        //         });
        //         parseToTree(parent.children);
        //     });
        // }

        //成功
        res.json({
            status: true,
            msg: "success!",
            data: results
        });
    });
});
module.exports = router;

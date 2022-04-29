const express = require('express');
const router = express.Router();
// 数据库
let pool = require('../../config/mysql');

/**
 * @api {get} /system/icon/list 获取所有element图标
 * @apiDescription 获取系统中的element图标，具备分页功能。
 * @apiName AdminIcon
 * @apiGroup Icon
 * @apiPermission admin
 *
 * @apiUse Authorization
 *
 * @apiQuery {Number} [pageSize=20] 一个页有多少个图标;
 * @apiQuery {Number} [pageIndex=1] 第几页;
 *
 * @apiSuccess {Object[]} icons 图标数组.
 * @apiSuccess {Number} total 图标总数.
 *
 * @apiSampleRequest /system/icon/list
 */
router.get('/list', async function (req, res) {
    let { pageSize = 20, pageIndex = 1 } = req.query;
    // 计算偏移量
    let size = parseInt(pageSize);
    let offset = size * (pageIndex - 1);
    // 查找图标
    let select_sql = `SELECT * FROM ICON LIMIT ? OFFSET ?`;
    let [icons] = await pool.query(select_sql, [size, offset]);
    // 计算总数
    let total_sql = `SELECT COUNT(*) as total FROM ICON`;
    let [total] = await pool.query(total_sql, []);
    // 获取成功
    res.json({
        status: true,
        msg: "获取成功！",
        data: icons,
        ...total[0],
    });
});

module.exports = router;

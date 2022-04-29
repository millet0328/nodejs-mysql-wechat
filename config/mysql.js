const mysql = require('mysql2/promise');
// 连接池pool（用于普通查询）
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'wechat-mall',
    // debug: true,
});

module.exports = pool;

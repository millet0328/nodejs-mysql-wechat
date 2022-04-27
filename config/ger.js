// Good Enough Recommendations (GER)
let g = require('ger');
// 创建数据库连接
let knex = g.knex({
    client: 'mysql',
    connection: {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'root',
        database: 'wechat-mall',
        // debug: true,
    },
});
// 创建存储空间，(数据库/内存均可)
let { esm: MysqlESM } = require('ger_mysql_esm');
let esm = new MysqlESM({ knex });

let ger = new g.GER(esm);
// 初始化命名空间
ger.initialize_namespace('wechat-mall');

module.exports = ger;
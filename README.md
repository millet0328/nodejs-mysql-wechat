# nodejs-mysql-wechat
基于nodejs + mySQL + express的商城后台API接口，同时支持微信小程序的商城API接口
#### 在线预览，请点击[API文档](https://luotuo19880328.github.io/nodejs-mysql-wechat/)

## 安装api文档插件
```
npm i apidoc -g
```

## 进入项目
```
cd {项目目录}
```

## 安装依赖包，必须cnpm
```
$ cnpm i
```

## 还原数据库
1. 在mysql中创建wechat-mall数据库
2. 将wechat-mall.sql文件还原至wechat-mall数据库
3. 在config文件夹mysql.js文件，配置数据库、账户、密码；

## 修改小程序配置
1. 注册小程序开发平台，获取小程序appid、小程序密钥
2. 在config文件夹wx.js文件，修改成自己的appid、小程序密钥

## 重新生成API文档
```
$ npm run api
```

## 启动
```
$ npm start
```

## 后台API文档地址
```
http://localhost:3003/api/
```
## 商城管理后台地址
```
http://localhost:3003/admin/
```

/*
 Navicat Premium Data Transfer

 Source Server         : app
 Source Server Type    : MySQL
 Source Server Version : 50553
 Source Host           : localhost:3306
 Source Schema         : wechat-mall

 Target Server Type    : MySQL
 Target Server Version : 50553
 File Encoding         : 65001

 Date: 21/05/2019 01:53:28
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for addresses
-- ----------------------------
DROP TABLE IF EXISTS `addresses`;
CREATE TABLE `addresses`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` int(11) NOT NULL COMMENT '用户id',
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '姓名',
  `tel` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '手机号',
  `province` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '省',
  `city` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '市',
  `area` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '区',
  `street` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '街道',
  `code` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '邮编',
  `isDefault` int(3) NULL DEFAULT 1 COMMENT '是否默认',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 21 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '收货地址' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of addresses
-- ----------------------------
INSERT INTO `addresses` VALUES (20, 1, '黄小米', '15863008280', '山东', '青岛', '崂山', '滨海大道', '2006601', 1);

-- ----------------------------
-- Table structure for admin
-- ----------------------------
DROP TABLE IF EXISTS `admin`;
CREATE TABLE `admin`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '用户名',
  `password` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '密码',
  `nickname` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '昵称',
  `sex` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '男' COMMENT '性别',
  `avatar` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT './images/avatar/default.jpg' COMMENT '头像',
  `tel` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '手机号码',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  `login_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '登录时间',
  `login_count` bigint(255) NOT NULL DEFAULT 1 COMMENT '登录次数',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 9 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '用户表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of admin
-- ----------------------------
INSERT INTO `admin` VALUES (2, '15863008280', '123456', '黄晓明', '女', '/images/avatar/default.jpg', '15863008280', '2019-05-11 18:21:37', '2019-05-21 00:56:37', 4);
INSERT INTO `admin` VALUES (1, 'admin', '123456', 'admin', '男', '/images/avatar/default.jpg', NULL, '2019-05-14 20:39:31', '2019-05-21 00:56:42', 12);

-- ----------------------------
-- Table structure for admin_role
-- ----------------------------
DROP TABLE IF EXISTS `admin_role`;
CREATE TABLE `admin_role`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `admin_id` int(11) NULL DEFAULT NULL COMMENT '用户id',
  `role_id` int(11) NULL DEFAULT NULL COMMENT '角色id',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 3 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Fixed;

-- ----------------------------
-- Records of admin_role
-- ----------------------------
INSERT INTO `admin_role` VALUES (1, 1, 1);
INSERT INTO `admin_role` VALUES (2, 2, 1);

-- ----------------------------
-- Table structure for carts
-- ----------------------------
DROP TABLE IF EXISTS `carts`;
CREATE TABLE `carts`  (
  `id` int(4) NOT NULL AUTO_INCREMENT,
  `uid` int(10) NOT NULL COMMENT '用户id',
  `goods_id` int(10) NOT NULL COMMENT '商品id',
  `goods_num` int(10) NOT NULL COMMENT '商品数量',
  `status` tinyint(4) NULL DEFAULT 1 COMMENT '1-正常，0-禁用，-1-删除',
  `create_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime NULL DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 25 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '购物车' ROW_FORMAT = Fixed;

-- ----------------------------
-- Records of carts
-- ----------------------------
INSERT INTO `carts` VALUES (22, 1, 15, 1, 1, NULL, NULL);

-- ----------------------------
-- Table structure for categories
-- ----------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '名称',
  `pId` int(11) NOT NULL COMMENT '父级id',
  `level` int(11) NULL DEFAULT NULL COMMENT '层级',
  `img` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 85 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '商品分类' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of categories
-- ----------------------------
INSERT INTO `categories` VALUES (1, '全部分类', 0, 1, '');
INSERT INTO `categories` VALUES (2, '家居家纺', 1, 2, '');
INSERT INTO `categories` VALUES (30, '灯具', 2, 3, '');
INSERT INTO `categories` VALUES (8, '家用电器', 1, 2, '');
INSERT INTO `categories` VALUES (12, '智能家庭', 1, 2, '');
INSERT INTO `categories` VALUES (13, '餐具厨房', 1, 2, '');
INSERT INTO `categories` VALUES (18, '服饰配饰', 1, 2, '');
INSERT INTO `categories` VALUES (29, '床垫', 2, 3, '');
INSERT INTO `categories` VALUES (19, '鞋靴箱包', 1, 2, '');
INSERT INTO `categories` VALUES (20, '手机电脑', 1, 2, '');
INSERT INTO `categories` VALUES (21, '电视影音', 1, 2, '');
INSERT INTO `categories` VALUES (22, '运动健康', 1, 2, '');
INSERT INTO `categories` VALUES (23, '出行户外', 1, 2, '');
INSERT INTO `categories` VALUES (24, '洗护美妆', 1, 2, '');
INSERT INTO `categories` VALUES (25, '日杂文创', 1, 2, '');
INSERT INTO `categories` VALUES (26, '母婴亲子', 1, 2, '');
INSERT INTO `categories` VALUES (27, '饮食酒水', 1, 2, '');
INSERT INTO `categories` VALUES (28, '数码配件', 1, 2, '');
INSERT INTO `categories` VALUES (31, '家具', 2, 3, '');
INSERT INTO `categories` VALUES (32, '被子', 2, 3, '');
INSERT INTO `categories` VALUES (33, '枕头', 2, 3, '');
INSERT INTO `categories` VALUES (34, '床品件套', 2, 3, '');
INSERT INTO `categories` VALUES (35, '家居收纳', 2, 3, '');
INSERT INTO `categories` VALUES (36, '厨房卫浴', 2, 3, '');
INSERT INTO `categories` VALUES (37, '家饰花卉', 2, 3, '');
INSERT INTO `categories` VALUES (38, '布艺软装', 2, 3, '');
INSERT INTO `categories` VALUES (39, '清洁电器', 8, 3, '');
INSERT INTO `categories` VALUES (40, '生活电器', 8, 3, '');
INSERT INTO `categories` VALUES (41, '洗衣机', 8, 3, '');
INSERT INTO `categories` VALUES (42, '冰箱', 8, 3, '');
INSERT INTO `categories` VALUES (43, '净水器', 8, 3, '');
INSERT INTO `categories` VALUES (44, '安防', 12, 3, '');
INSERT INTO `categories` VALUES (45, '路由器', 12, 3, '');
INSERT INTO `categories` VALUES (46, '开关插座', 12, 3, '');
INSERT INTO `categories` VALUES (47, '相机', 12, 3, '');
INSERT INTO `categories` VALUES (48, '羽绒服', 18, 3, '');
INSERT INTO `categories` VALUES (49, '外套', 18, 3, '');
INSERT INTO `categories` VALUES (50, '裤装', 18, 3, '');
INSERT INTO `categories` VALUES (51, '卫衣', 18, 3, '');
INSERT INTO `categories` VALUES (52, 'T恤', 18, 3, '');
INSERT INTO `categories` VALUES (53, '衬衫', 18, 3, '');
INSERT INTO `categories` VALUES (54, '针织毛衫', 18, 3, '');
INSERT INTO `categories` VALUES (55, '时尚女装', 18, 3, '');
INSERT INTO `categories` VALUES (56, '运动装', 18, 3, '');
INSERT INTO `categories` VALUES (57, '运动/户外鞋', 19, 3, '');
INSERT INTO `categories` VALUES (58, '凉鞋/拖鞋', 19, 3, '');
INSERT INTO `categories` VALUES (59, '男鞋', 19, 3, '');
INSERT INTO `categories` VALUES (60, '女鞋', 19, 3, '');
INSERT INTO `categories` VALUES (61, '小米系列', 20, 3, '');
INSERT INTO `categories` VALUES (62, '红米系列', 20, 3, '');
INSERT INTO `categories` VALUES (63, '游戏本15.6\"', 20, 3, '');
INSERT INTO `categories` VALUES (64, '笔记本12.5\"', 20, 3, '');
INSERT INTO `categories` VALUES (65, '笔记本15.6\"', 20, 3, '');
INSERT INTO `categories` VALUES (66, '鼠标键盘', 20, 3, '');
INSERT INTO `categories` VALUES (67, '保健器械', 22, 3, '');
INSERT INTO `categories` VALUES (68, '康体监护', 22, 3, '');
INSERT INTO `categories` VALUES (69, '运动健身', 22, 3, '');
INSERT INTO `categories` VALUES (70, '泳衣泳具', 22, 3, '');
INSERT INTO `categories` VALUES (71, '护理护具', 22, 3, '');
INSERT INTO `categories` VALUES (72, '骑行', 23, 3, '');
INSERT INTO `categories` VALUES (73, '平衡车/滑板车', 23, 3, '');
INSERT INTO `categories` VALUES (74, '汽车用品', 23, 3, '');
INSERT INTO `categories` VALUES (75, '户外装备', 23, 3, '');
INSERT INTO `categories` VALUES (76, '户外烧烤', 23, 3, '');
INSERT INTO `categories` VALUES (77, '口腔清洁', 24, 3, '');
INSERT INTO `categories` VALUES (78, '洗护用具', 24, 3, '');
INSERT INTO `categories` VALUES (79, '毛巾浴巾', 24, 3, '');
INSERT INTO `categories` VALUES (80, '基础护肤', 24, 3, '');
INSERT INTO `categories` VALUES (81, '身体护理', 24, 3, '');
INSERT INTO `categories` VALUES (82, '彩妆香氛', 24, 3, '');
INSERT INTO `categories` VALUES (83, '居家清洁', 24, 3, '');
INSERT INTO `categories` VALUES (84, '桌面办公', 20, 3, '');

-- ----------------------------
-- Table structure for goods
-- ----------------------------
DROP TABLE IF EXISTS `goods`;
CREATE TABLE `goods`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cate_1st` int(11) NOT NULL COMMENT '一级分类id',
  `cate_2nd` int(11) NOT NULL COMMENT '二级分类id',
  `cate_3rd` int(11) NULL DEFAULT NULL COMMENT '三级分类id',
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '商品名称',
  `hotPoint` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '商品热点描述',
  `price` decimal(10, 2) NOT NULL COMMENT '商品价格',
  `marketPrice` decimal(10, 2) NOT NULL COMMENT '市场价',
  `cost` decimal(10, 2) NOT NULL COMMENT '成本价',
  `discount` decimal(10, 0) NULL DEFAULT NULL COMMENT '折扣',
  `inventory` int(11) NOT NULL COMMENT '库存',
  `articleNo` int(20) NOT NULL COMMENT '货号',
  `img_lg` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '商品主图-720',
  `img_md` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '商品主图-360',
  `slider` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '商品轮播图片',
  `brand` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '商品品牌',
  `detail` varchar(5000) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '商品详情',
  `freight` decimal(10, 0) NULL DEFAULT 0 COMMENT '商品运费',
  `create_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime NULL DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 29 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '商品表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of goods
-- ----------------------------
INSERT INTO `goods` VALUES (15, 20, 63, 0, '机械师F117荣耀版 游戏本七代i7-7700HQ/GTX1050Ti 4G独显游戏本笔记本电脑', '【9月20号0:00首发，预约享12期免息特权，仅此一天】【鎏金3D金属A壳】【1677万色RGB背光键盘】【IPS雾面屏】', 6999.00, 7500.00, 6000.00, 0, 998, 1, '/images/goods/b5dcffe0-e7b0-11e8-8eb5-2933d116d7fc_720.jpg', '/images/goods/b5dcffe0-e7b0-11e8-8eb5-2933d116d7fc_360.jpg', '/images/goods/b7604480-e7b0-11e8-8eb5-2933d116d7fc_720.jpg,/images/goods/b8fc6850-e7b0-11e8-8eb5-2933d116d7fc_720.jpg,/images/goods/ba1615b0-e7b0-11e8-8eb5-2933d116d7fc_720.jpg,/images/goods/bb5a5580-e7b0-11e8-8eb5-2933d116d7fc_720.jpg', '机械师', '<p><img src=\"http:127.0.0.1:3000/images/details/c7c5f5e0-e7b0-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width:100%;\"><img src=\"http:127.0.0.1:3000/images/details/c999a470-e7b0-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/cba81210-e7b0-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/ce3bdc50-e7b0-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/ef071800-e7b0-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/f0bcde50-e7b0-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/f2c44710-e7b0-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/f4ba98d0-e7b0-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><br></p>', 0, '2018-11-14 09:59:57', NULL);
INSERT INTO `goods` VALUES (16, 20, 84, 0, '【京东配送】AOC C2791VHE/WS 27英寸 1800R曲率 VA广视角 家用电竞双实力 不闪屏曲面显示器', '1800R曲率 VA广视角 家用电竞双实力 不闪屏曲面显示器', 1249.00, 1500.00, 1000.00, 0, 998, 2, '/images/goods/93016550-e7b1-11e8-8eb5-2933d116d7fc_720.jpg', '/images/goods/93016550-e7b1-11e8-8eb5-2933d116d7fc_360.jpg', '/images/goods/948ebc10-e7b1-11e8-8eb5-2933d116d7fc_720.jpg,/images/goods/95d9d9b0-e7b1-11e8-8eb5-2933d116d7fc_720.jpg,/images/goods/96e3a890-e7b1-11e8-8eb5-2933d116d7fc_720.jpg,/images/goods/98a6dc60-e7b1-11e8-8eb5-2933d116d7fc_720.jpg', 'AOC', '	<p><img src=\"http:127.0.0.1:3000/images/details/a1e7c9b0-e7b1-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width:100%;\"><img src=\"http:127.0.0.1:3000/images/details/a3afdf80-e7b1-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/a55af770-e7b1-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/a7204e20-e7b1-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/a89fe940-e7b1-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/aa1a0620-e7b1-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><br></p>', 0, '2018-11-14 10:04:52', NULL);
INSERT INTO `goods` VALUES (17, 20, 84, 0, '京天（KOTIN）第八代i5 8400/GTX1050Ti 4GD独显吃鸡游戏组装机DIY台式组装电脑主机', '更“芯”换代，升级配置，请联系客服。', 4599.00, 5000.00, 4000.00, 0, 1000, 3, '/images/goods/0bda9730-e7b2-11e8-8eb5-2933d116d7fc_720.jpg', '/images/goods/0bda9730-e7b2-11e8-8eb5-2933d116d7fc_360.jpg', '/images/goods/0f6d5ae0-e7b2-11e8-8eb5-2933d116d7fc_720.jpg,/images/goods/10eccef0-e7b2-11e8-8eb5-2933d116d7fc_720.jpg,/images/goods/11f628a0-e7b2-11e8-8eb5-2933d116d7fc_720.jpg', '京天', '<p><img src=\"http:127.0.0.1:3000/images/details/201879b0-e7b2-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width:100%;\"><img src=\"http:127.0.0.1:3000/images/details/219a85d0-e7b2-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/232df710-e7b2-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/24f326b0-e7b2-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/266f8d80-e7b2-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/28101e20-e7b2-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/29d12f10-e7b2-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/2c030330-e7b2-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><br></p>', 0, '2018-11-14 10:08:31', NULL);
INSERT INTO `goods` VALUES (18, 20, 65, 0, '惠普(HP) 幽灵Spectre x360 13.3英寸超轻薄翻转笔记本', '13.9mm超薄！全金属！360°翻转触控！窄边框！带手写触控笔！（SSD FHD 触控屏 黑金版）', 8499.00, 9000.00, 6000.00, 0, 1000, 4, '/images/goods/f56613b0-e7b3-11e8-8eb5-2933d116d7fc_720.jpg', '/images/goods/f56613b0-e7b3-11e8-8eb5-2933d116d7fc_360.jpg', '/images/goods/f6df6d40-e7b3-11e8-8eb5-2933d116d7fc_720.jpg,/images/goods/f828b620-e7b3-11e8-8eb5-2933d116d7fc_720.jpg,/images/goods/f92083a0-e7b3-11e8-8eb5-2933d116d7fc_720.jpg,/images/goods/fa6d00d0-e7b3-11e8-8eb5-2933d116d7fc_720.jpg,/images/goods/fbd6a', 'HP', '<p><img src=\"http:127.0.0.1:3000/images/details/4a8f9220-e7b5-11e8-8eb5-2933d116d7fc.png\" style=\"max-width:100%;\"><img src=\"http:127.0.0.1:3000/images/details/4cda6c80-e7b5-11e8-8eb5-2933d116d7fc.png\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/4f0a1dc0-e7b5-11e8-8eb5-2933d116d7fc.png\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/50ccb550-e7b5-11e8-8eb5-2933d116d7fc.png\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/52886f10-e7b5-11e8-8eb5-2933d116d7fc.png\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/554b86b0-e7b5-11e8-8eb5-2933d116d7fc.png\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/57857120-e7b5-11e8-8eb5-2933d116d7fc.png\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/59596dd0-e7b5-11e8-8eb5-2933d116d7fc.png\" style=\"max-width: 100%;\"><br></p>	', 0, '2018-11-14 10:31:26', NULL);
INSERT INTO `goods` VALUES (19, 18, 52, 0, '【5折抢购】CH新款潮流短袖T恤衫学生休闲假两件日系韩版潮修身纯色短T恤男', '限时抢购经典假两件纯棉纯色T恤衫，潮男必备！ ！ ！', 49.00, 60.00, 20.00, 0, 1000, 5, '/images/goods/a37041a0-e7b5-11e8-8eb5-2933d116d7fc_720.jpg', '/images/goods/a37041a0-e7b5-11e8-8eb5-2933d116d7fc_360.jpg', '/images/goods/a4bdf750-e7b5-11e8-8eb5-2933d116d7fc_720.jpg,/images/goods/a66e1850-e7b5-11e8-8eb5-2933d116d7fc_720.jpg,/images/goods/a76b3d00-e7b5-11e8-8eb5-2933d116d7fc_720.jpg,/images/goods/a8b4fb10-e7b5-11e8-8eb5-2933d116d7fc_720.jpg', 'CH', '<p><img src=\"http:127.0.0.1:3000/images/details/b110df90-e7b5-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width:100%;\"><img src=\"http:127.0.0.1:3000/images/details/b298b810-e7b5-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/b41fa630-e7b5-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/b59926d0-e7b5-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/b7cca8a0-e7b5-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/b90af500-e7b5-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/baba2ba0-e7b5-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/bd659c90-e7b5-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><br></p>		', 0, '2018-11-14 10:34:06', NULL);
INSERT INTO `goods` VALUES (24, 18, 52, 0, '幸福时光男装2017新款秋冬新款格子衬衫韩版休闲C35', 'C35', 89.00, 120.00, 20.00, 0, 1000, 6, '/images/goods/0b78fcf0-e7b7-11e8-8eb5-2933d116d7fc_720.jpg', '/images/goods/0b78fcf0-e7b7-11e8-8eb5-2933d116d7fc_360.jpg', '/images/goods/0cd35cd0-e7b7-11e8-8eb5-2933d116d7fc_720.jpg,/images/goods/0e1b9440-e7b7-11e8-8eb5-2933d116d7fc_720.jpg,/images/goods/0f4c9a30-e7b7-11e8-8eb5-2933d116d7fc_720.jpg,/images/goods/109f31e0-e7b7-11e8-8eb5-2933d116d7fc_720.jpg', '幸福时光', '<p><img src=\"http:127.0.0.1:3000/images/details/1a3ff270-e7b7-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width:100%;\"><img src=\"http:127.0.0.1:3000/images/details/1b9dfbd0-e7b7-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/1d630460-e7b7-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/1f1cc250-e7b7-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/2091d620-e7b7-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/2210adf0-e7b7-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/242758f0-e7b7-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/25b30200-e7b7-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/27f773c0-e7b7-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/2a3a37d0-e7b7-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/2c0bc380-e7b7-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/2dea6e90-e7b7-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><br></p>	', 0, '2018-11-14 10:44:30', NULL);
INSERT INTO `goods` VALUES (25, 23, 75, 0, '探路者Toread男装棉T恤-TAJF81937-C27X', '', 65.00, 80.00, 20.00, 0, 992, 7, '/images/goods/9c360ee0-e7b7-11e8-8eb5-2933d116d7fc_720.jpg', '/images/goods/9c360ee0-e7b7-11e8-8eb5-2933d116d7fc_360.jpg', '/images/goods/9dd47ca0-e7b7-11e8-8eb5-2933d116d7fc_720.jpg,/images/goods/9f6f19d0-e7b7-11e8-8eb5-2933d116d7fc_720.jpg,/images/goods/a0bea440-e7b7-11e8-8eb5-2933d116d7fc_720.jpg,/images/goods/a1be39f0-e7b7-11e8-8eb5-2933d116d7fc_720.jpg', '探路者', '<p><img src=\"http:127.0.0.1:3000/images/details/ac04fe80-e7b7-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width:100%;\"><img src=\"http:127.0.0.1:3000/images/details/ad9dee00-e7b7-11e8-8eb5-2933d116d7fc.png\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/af0f3140-e7b7-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/b07fd840-e7b7-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/b258b6f0-e7b7-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/b3c147a0-e7b7-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/b52fcbc0-e7b7-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/b719e880-e7b7-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><br></p>		\r\n', 0, '2018-11-14 10:48:13', NULL);
INSERT INTO `goods` VALUES (26, 23, 75, 0, 'AIRTEX亚特户外男女防晒衣轻薄透气弹力皮肤风衣夹克长款外套M2169&W2170', '弹力面料 防晒轻簿 中长款', 259.00, 300.00, 100.00, 0, 992, 8, '/images/goods/ef53fb50-e7b7-11e8-8eb5-2933d116d7fc_720.jpg', '/images/goods/ef53fb50-e7b7-11e8-8eb5-2933d116d7fc_360.jpg', '/images/goods/f0a6e120-e7b7-11e8-8eb5-2933d116d7fc_720.jpg,/images/goods/f1f13b70-e7b7-11e8-8eb5-2933d116d7fc_720.jpg,/images/goods/f2e119b0-e7b7-11e8-8eb5-2933d116d7fc_720.jpg,/images/goods/f41a0ee0-e7b7-11e8-8eb5-2933d116d7fc_720.jpg', 'AIRTEX', '<p><img src=\"http:127.0.0.1:3000/images/details/03eb2160-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width:100%;\"><img src=\"http:127.0.0.1:3000/images/details/05a83ab0-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/06e638f0-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/08607ce0-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/0a104fc0-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/0bb43bc0-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/1f121e80-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/2121c4a0-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/246e5790-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/26c0fa20-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/28c3cf00-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><br></p>		\r\n', 0, '2018-11-14 10:51:24', NULL);
INSERT INTO `goods` VALUES (27, 23, 72, 0, '永久（FOREVER）自行车24速山地车26寸转把双碟刹男女式学生单车 猎狐T01-A', '温馨提示：新疆西藏地区暂不支持配送，自行车属大件商品，如人为原因拒收，需客户承担运费\n每天14：30前发货，客服在线时间9点-17点\n★【11月12日-15日返场购车领券满399-30 另加送骑行手电 评价还送二重礼包】', 599.00, 700.00, 300.00, 0, 1000, 9, '/images/goods/6de67a60-e7b8-11e8-8eb5-2933d116d7fc_720.jpg', '/images/goods/6de67a60-e7b8-11e8-8eb5-2933d116d7fc_360.jpg', '/images/goods/6f328260-e7b8-11e8-8eb5-2933d116d7fc_720.jpg,/images/goods/708a9850-e7b8-11e8-8eb5-2933d116d7fc_720.jpg,/images/goods/7160d410-e7b8-11e8-8eb5-2933d116d7fc_720.jpg,/images/goods/73521cc0-e7b8-11e8-8eb5-2933d116d7fc_720.jpg', '永久', '<p><img src=\"http:127.0.0.1:3000/images/details/7a82c7b0-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width:100%;\"><img src=\"http:127.0.0.1:3000/images/details/7bd78240-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/7d807750-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/7eb1a450-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/80547ee0-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/81b60ab0-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/837ce800-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/85267950-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><br></p>		\r\n', 0, '2018-11-14 10:53:56', NULL);
INSERT INTO `goods` VALUES (28, 23, 72, 0, '凤凰 高碳钢破风设计21速钳型刹越野学生车弯把公路车自行车', '用户需知：新疆西藏地区暂不支持配送，自行车属大件商品，如人为原因拒收商品，由用户自行承担退回所产生的运费！！！', 768.00, 900.00, 350.00, 0, 1000, 10, '/images/goods/b63efc60-e7b8-11e8-8eb5-2933d116d7fc_720.jpg', '/images/goods/b63efc60-e7b8-11e8-8eb5-2933d116d7fc_360.jpg', '/images/goods/b8042c00-e7b8-11e8-8eb5-2933d116d7fc_720.jpg,/images/goods/b95d5360-e7b8-11e8-8eb5-2933d116d7fc_720.jpg,/images/goods/ba73a560-e7b8-11e8-8eb5-2933d116d7fc_720.jpg', '凤凰', '<p><img src=\"http:127.0.0.1:3000/images/details/c11f8ff0-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width:100%;\"><img src=\"http:127.0.0.1:3000/images/details/c2d667b0-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/c47857e0-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/c5d1cd60-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/c7597ed0-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/ca644dd0-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/cbf9e1f0-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/cd84c7b0-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/cef4d270-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/d1a684f0-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/d3d090e0-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/d5f93d40-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/d8684170-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/db0867c0-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/defc1020-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/e18b6d90-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/e47c24e0-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><img src=\"http:127.0.0.1:3000/images/details/f472c0c0-e7b8-11e8-8eb5-2933d116d7fc.jpg\" style=\"max-width: 100%;\"><br></p>		\r\n', 0, '2018-11-14 10:57:06', NULL);

-- ----------------------------
-- Table structure for menu
-- ----------------------------
DROP TABLE IF EXISTS `menu`;
CREATE TABLE `menu`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '菜单id',
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '菜单名称',
  `pId` int(11) NULL DEFAULT NULL COMMENT '父级id',
  `path` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '链接url',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 2 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of menu
-- ----------------------------
INSERT INTO `menu` VALUES (1, '全部菜单', 0, NULL);

-- ----------------------------
-- Table structure for order_addresses
-- ----------------------------
DROP TABLE IF EXISTS `order_addresses`;
CREATE TABLE `order_addresses`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL COMMENT '订单id',
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '姓名',
  `tel` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '手机号',
  `province` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '省',
  `city` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '市',
  `area` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '区',
  `street` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '街道',
  `code` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '邮编',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 23 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '收货地址' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of order_addresses
-- ----------------------------
INSERT INTO `order_addresses` VALUES (20, 7, '黄小米', '15863008280', '山东', '青岛', '崂山', '滨海大道', '2006601');
INSERT INTO `order_addresses` VALUES (21, 6, '黄小米', '15863008280', '山东', '青岛', '崂山', '滨海大道', '2006601');
INSERT INTO `order_addresses` VALUES (22, 16, '黄小米', '15863008280', '山东', '青岛', '崂山', '滨海大道', '2006601');

-- ----------------------------
-- Table structure for order_goods
-- ----------------------------
DROP TABLE IF EXISTS `order_goods`;
CREATE TABLE `order_goods`  (
  `id` int(4) NOT NULL AUTO_INCREMENT,
  `order_id` int(10) NOT NULL COMMENT '订单id',
  `goods_id` int(10) NULL DEFAULT NULL COMMENT '商品id',
  `goods_num` int(10) NULL DEFAULT NULL COMMENT '商品数量',
  `goods_price` double(20, 2) NULL DEFAULT NULL COMMENT '商品价格',
  `status` tinyint(4) NULL DEFAULT 1 COMMENT '0-禁用，1-正常，-1-删除',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 15 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '订单-商品表' ROW_FORMAT = Fixed;

-- ----------------------------
-- Records of order_goods
-- ----------------------------
INSERT INTO `order_goods` VALUES (12, 7, 15, 1, 6999.00, 1, '2018-11-22 09:59:58');
INSERT INTO `order_goods` VALUES (11, 7, 16, 1, 1249.00, 1, '2018-11-22 09:59:58');
INSERT INTO `order_goods` VALUES (10, 6, 15, 1, 6999.00, 1, '2018-11-21 20:34:28');
INSERT INTO `order_goods` VALUES (9, 6, 16, 2, 1249.00, 1, '2018-11-21 20:34:28');
INSERT INTO `order_goods` VALUES (13, 16, 25, 1, 65.00, 1, '2018-11-23 15:52:56');
INSERT INTO `order_goods` VALUES (14, 16, 26, 1, 259.00, 1, '2018-11-23 15:52:56');

-- ----------------------------
-- Table structure for order_status
-- ----------------------------
DROP TABLE IF EXISTS `order_status`;
CREATE TABLE `order_status`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` tinyint(10) NULL DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `text` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 11 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '订单状态-字典表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of order_status
-- ----------------------------
INSERT INTO `order_status` VALUES (1, -1, 'CREAT_FAILED', '创建订单失败');
INSERT INTO `order_status` VALUES (2, 0, 'WAIT_BUYER_PAY', '等待买家付款');
INSERT INTO `order_status` VALUES (3, 1, 'PAYMENT_CONFIRMING', '付款确认中');
INSERT INTO `order_status` VALUES (4, 2, 'BUYER_PAYMENT_FAILED', '买家付款失败');
INSERT INTO `order_status` VALUES (5, 3, 'BUYER_PAYMENT_SUCCESS', '买家付款成功');
INSERT INTO `order_status` VALUES (6, 4, 'SELLER_DELIVERED', '卖家已发货');
INSERT INTO `order_status` VALUES (7, 5, 'BUYER_RECEIVED', '买家已收货/交易完成');
INSERT INTO `order_status` VALUES (8, 6, 'GOODS_RETURNING', '退货中');
INSERT INTO `order_status` VALUES (9, 7, 'GOODS_RETURNED_SUCCESS', '退货成功');
INSERT INTO `order_status` VALUES (10, 8, 'ORDER_CLOSED', '订单关闭');

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders`  (
  `id` int(4) NOT NULL AUTO_INCREMENT,
  `uid` int(10) NOT NULL COMMENT '用户id',
  `payment` double(20, 2) NULL DEFAULT NULL COMMENT '支付金额',
  `payment_type` tinyint(2) NULL DEFAULT NULL COMMENT '1-在线支付，1-货到付款',
  `pay_time` datetime NULL DEFAULT NULL COMMENT '支付时间',
  `ship_fee` double(20, 2) NULL DEFAULT NULL COMMENT '邮费',
  `ship_time` datetime NULL DEFAULT NULL COMMENT '发货时间',
  `ship_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '快递公司',
  `ship_number` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '快递单号',
  `received_time` datetime NULL DEFAULT NULL COMMENT '收货时间',
  `create_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime NULL DEFAULT NULL COMMENT '更新时间',
  `finish_time` datetime NULL DEFAULT NULL COMMENT '交易完成时间',
  `close_time` datetime NULL DEFAULT NULL COMMENT '交易关闭时间',
  `order_state` int(10) NULL DEFAULT 0 COMMENT '状态字典',
  `status` tinyint(4) NULL DEFAULT 1 COMMENT '1-正常，0-禁用，-1-删除',
  `refund_state` tinyint(4) NULL DEFAULT NULL COMMENT '退款状态',
  `comment_state` tinyint(4) NULL DEFAULT NULL COMMENT '评论状态',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 17 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '订单表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of orders
-- ----------------------------
INSERT INTO `orders` VALUES (7, 1, 2000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2018-11-22 09:59:58', NULL, NULL, NULL, 0, 1, NULL, NULL);
INSERT INTO `orders` VALUES (6, 1, 3500.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2018-11-21 20:34:28', NULL, NULL, NULL, 0, 1, NULL, NULL);
INSERT INTO `orders` VALUES (16, 2, 5000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2018-11-23 15:52:56', NULL, NULL, NULL, 0, 1, NULL, NULL);

-- ----------------------------
-- Table structure for role
-- ----------------------------
DROP TABLE IF EXISTS `role`;
CREATE TABLE `role`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '角色id',
  `role_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '角色名称',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 4 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of role
-- ----------------------------
INSERT INTO `role` VALUES (1, '超级管理员');
INSERT INTO `role` VALUES (2, '管理员');
INSERT INTO `role` VALUES (3, '运营人员');

-- ----------------------------
-- Table structure for role_menu
-- ----------------------------
DROP TABLE IF EXISTS `role_menu`;
CREATE TABLE `role_menu`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_id` int(11) NULL DEFAULT NULL COMMENT '角色id',
  `menu_id` int(11) NULL DEFAULT NULL COMMENT '权限id',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Fixed;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nickname` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '昵称',
  `sex` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '男' COMMENT '性别 0：未知、1：男、2：女',
  `avatar` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT './images/avatar/default.jpg' COMMENT '头像',
  `tel` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '手机号码',
  `country` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '国家',
  `province` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '省',
  `city` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '市',
  `openid` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '小程序唯一标示id',
  `session_key` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '会话密钥',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 4 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '用户表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (3, '紫风', '1', 'https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83ersiaibpEqVs2Id31CMSTyA4BDxKKib2ayvUx1lwFJeIDGSmCJaXfxPKem9cIiaDoiaBFf3Th733UCOOlg/132', NULL, 'China', 'Shandong', 'Qingdao', 'oShUg5dO2dJN7gjezrL3CvBOoHP0', 'zAwdZYyoUI6NBn/95KpNeQ==');

SET FOREIGN_KEY_CHECKS = 1;

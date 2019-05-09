// 通过mongoose创建模型，类似于TP中的model
var mongoose = require('mongoose');
var MovisSchema = require('../schemas/movie'); // 获得模式
var Movie = mongoose.model('Movie', MovisSchema); // 将模式使用到Movie模型上
module.exports = Movie; // 导出，暴露给module对象
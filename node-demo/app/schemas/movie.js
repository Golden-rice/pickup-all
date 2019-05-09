// 创建模式，相当SQL语句
var mongoose = require('mongoose');
// 表字段
var MovieSchema = new mongoose.Schema({
    doctor: String,
    title: String,
    language: String,
    country: String,
    year: String,
    summary: String,
    poster: String,
    // pv: {
    //     type:Number,
    //     default: 0
    // },
    meta: { // 创建或更新时间的记录
        createAt: {
            type: Date,
            default: Date.now() // 默认值
        },
        updateAt: {
            type: Date,
            default: Date.now()
        }
    }
});
// 启用save前(pre)会调用改方法
MovieSchema.pre('save', function (next) {
    if (this.isNew) { // 是否是新数据 isNew
        this.meta.createAt = this.meta.updateAt = Date.now();
    } else { // 否则仅更新
        this.meta.updateAt = Date.now();
    }
    next();
});
// 静态方法，不与数据库交互，仅在model实例化后，才可以使用
MovieSchema.statics = {
    fetch: function (cb) { // 设置fetch方法，批量查询
        return this
			.find({}) // 查找
			.sort('meta.updateAt') // 排序
			.exec(cb); //执行
    },
    findById: function (id, cb) { // 通过id查询
        return this
            .findOne({_id: id})
            .exec(cb);
    }
};

module.exports = MovieSchema;
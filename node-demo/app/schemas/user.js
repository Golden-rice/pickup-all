var mongoose = require('mongoose');
var bcrypt = require('bcryptjs'); // 专为密码计算设计的模块，密码加盐 
var SALT_WORK_FACTOR = 10; // 计算强度, 默认10 最强
var UserSchema = new mongoose.Schema({
		name: {
			type: String,
			unique: true
		},
		password: String, 
    role: { // 0: normal / >50: admin
      type: Number,
      default: 0
    },
    meta: {
        createAt: {
            type: Date,
            default: Date.now() 
        },
        updateAt: {
            type: Date,
            default: Date.now()
        }
    }
});


UserSchema.pre('save', function (next) {
	var user = this;
  if (this.isNew) { 
      this.meta.createAt = this.meta.updateAt = Date.now();
  } else { 
      this.meta.updateAt = Date.now();
  }
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){ // 生成盐
  	if(err) return next(err);
  	bcrypt.hash(user.password, salt, function(err, hash){
  		if(err) return next(err);
  		user.password = hash;
	  	next();
  	});
  });
  // next()  // next 什么用
});



// 实例方法
UserSchema.methods = {
  comparePassword: function(_password, cb) {
    bcrypt.compare(_password, this.password, function(err, isMatch) {
      if (err) return cb(err);
      cb(null, isMatch);
    });
  }
};


UserSchema.statics = { // 静态方法，模型中可用
  fetch: function (cb) { 
    return this
		  .find({}) 
		  .sort('meta.updateAt') 
		  .exec(cb); 
	},
  findById: function (id, cb) { 
    return this
      .findOne({_id: id})
      .exec(cb);
  }
};

module.exports = UserSchema;
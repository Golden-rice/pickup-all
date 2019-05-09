var User = require('../models/user.js'); 

// showsignup
exports.showSignup = function(req, res){
	res.render('signup',{
		title: '注册页面'
	});
};

exports.showSignin = function(req, res){
	res.render('signin',{
		title: '登录页面'
	});
};

// signup 注册
exports.signup = function(req, res){
	var _user = req.body.user;
	User.find({name:_user.name}, function(err, user){
		if(err){
			console.log(err);
		}
		if(user.length>0){ // 有用户
			return res.redirect('/signup');
		}
		else{ // 新用户
			user = User(_user);
			user.save(function(err, user){
				if(err){
					console.log(err);
				}
				// console.log(user)
				res.redirect('/');
			});
		}
	});
};

// signin 登录
exports.signin = function(req, res){
	var _user = req.body.user;
	var name  = _user.name;
	var password = _user.password;

	User.findOne({name: _user.name}, function(err, user){
		if(err){
			console.log(err);
		}
		if( user === [] ){ // 没有该用户
			return res.redirect('/signin');
		}

		user.comparePassword(password, function(err, isMatch){
			if(err){
				console.log(err);
			}
			if(isMatch){ // 匹配上
				req.session.user = user; // 为session 
				return res.redirect('/');
			}
			else{ // 未匹配上
				console.log('Password is not matched!');
				return res.redirect('/signin');
			}
		});
	});
};


// logout 登出
exports.logout = function(req, res){
	delete req.session.user;
	// delete app.locals.user
	res.redirect('/');
};

// get userlist 
exports.userList = function(req, res){
  User.fetch(function (err, users) {
    if (err) {
      console.log(err);
    }
    res.render('userlist', { // list.jade
    	title:'用户-列表',
    	users: users
		});
  });
};

// user signin required
exports.signinRequired = function(req, res, next){
	var user = req.session.user;
	if(!user){
		return res.redirect('/signin');
	}
	next();
};

// user admin required
exports.adminRequired = function(req, res, next){
	var user = req.session.user;
	if(user.role <= 10){
		return res.send('权限不够');
	}
	next();
};
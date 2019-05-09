var Index = require('../app/controllers/index')
var User = require('../app/controllers/user')
var Movie = require('../app/controllers/movie')
var Comment = require('../app/controllers/comment')

module.exports = function(app){

// pre handle user 预处理
app.use(function(req, res, next){
	var _user = req.session.user;
	// if(_user){
		app.locals.user = _user // 本地变量
	// }
	next()
})

// index 首页
app.get('/', Index.index);

// User 用户
app.get('/signup', User.showSignup)
app.get('/signin', User.showSignin)
app.post('/user/signup', User.signup)
app.post('/user/signin', User.signin)
app.get('/logout', User.logout)
app.get('/admin/userlist', User.signinRequired, User.adminRequired, User.userList) // User.adminRequired, 

// Movie 电影
app.get('/admin/movie/list', User.signinRequired, User.adminRequired, Movie.list)
app.delete('/admin/list', User.signinRequired, User.adminRequired, Movie.del)
app.get('/movie/:id', Movie.detail)
app.post('/admin/movie/new', User.signinRequired, User.adminRequired, Movie.save)
app.get('/admin/movie/update/:id', User.signinRequired, User.adminRequired, Movie.update)
app.get('/admin/movie', User.signinRequired, User.adminRequired, Movie.new)

// Comment 评论
app.post('/user/comment', User.signinRequired, Comment.save)

// 404
app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
  next()
});

// 错误处理器
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
  next()
});

}
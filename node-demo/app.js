var express = require('express'); 
var mongoose = require('mongoose'); 
var cookieParser = require('cookie-parser')
var cookieSession = require('cookie-session');
var logger = require('morgan'); // 中间件
var fs = require('fs');

var env = process.env.NODE_ENV || 'development';
var app = express(); // 实例化
var port = process.env.PORT || 3000;  // 端口号
var path = require('path'); 
var dbUrl = 'mongodb://localhost/movie'
// models loading
var models_path = __dirname + '/app/models'

var walk = function(path){
	fs
		.readdirSync(path)
		.forEach(function(file){
			var newPath = path + '/' + file
			var stat = fs.statSync(newPath)

			if(stat.isFile()){ // 文件存在
				if(/(.*)\.(js|coffee)/.test(file)){ // js或coffee文件
					require(newPath) // 加载
				}
			}
			else if(stat.isDirectory()){
				walk(newPath) // 递归遍历
			}
		})
}
console.log(env)

walk(models_path) // 直接引用mongose中的model
mongoose.connect( dbUrl ); 
app.set('views', './app/views/pages'); // 视图地址
app.set('view engine', 'jade'); // 视图引擎
app.listen(port); // 端口号
app.locals.moment = require('moment') // 时间
app.use(express.static(path.join(__dirname, 'public'))); // __dirname当前目录 path.join() 拼接
app.use(require('body-parser').urlencoded({extended: true})); // 类似于node中的 querystring 来讲json 格式生成url格式
app.use(cookieParser())
app.use(cookieSession({
	secret: 'movie'
	// , // 
	// store: new mongoStore({ // mongostore
	// 	url : dbUrl,
	// 	collection: 'sessions'
	// })
}))
console.log('server is starting on port '+port);

// 开发环境 调试配置
if('development' === app.get('env')){ // env 是开发环境
	app.set('showStackError', true);
	app.use(logger(':method :url :status'));// 中间件: 请求方法 地址 状态
	app.locals.pretty = true; // html + js 源码格式化，增加可读性
	mongoose.set('debug', true); // mongose 数据 
}

require('./config/routes')(app)
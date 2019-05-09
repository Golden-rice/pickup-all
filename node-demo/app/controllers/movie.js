var Movie = require('../models/movie'); 
var Comment = require('../models/comment');
var _ = require('underscore'); 

exports.list = function(req, res){
  Movie.fetch(function (err, movies) {
      if (err) {
          console.log(err);
      }
      res.render('list', { // list.jade
      	title:'电影-列表',
      	 movies: movies
		});
  });
};

// list delete
exports.del = function(req, res){ // 通过delete请求
	var id = req.query.id;
	if(id){
		Movie.remove({_id: id},function(err, movie){
			if(err){
				console.log(err);
			}else{
				res.json({success: 1});
			}
		});
	}
};

exports.detail = function(req, res){
  var id = req.params.id; // get 到参数id
  var comments;

  Movie.findById(id, function (err, movie) {
  	Comment
  		.find({movie: id})
      .populate('from', 'name')
      .populate('reply.from reply.to', 'name')
  		.exec(function(err, comments){
		  	if(err){
		  		console.log(err);
		  	}
		    res.render('detail', {
		        title: '电影-'+movie.title, 
		        comments: comments,
		        movie: movie
		    });
  		});
   });
};

// admin post movie 添加对象
exports.save = function(req, res){ // post
	
	var id = req.body.movie._id; // 请求的movie的id 
	var movieObj = req.body.movie; // 请求的movie
	var _movie; // 覆盖原请求对象的新对象


	if( id !== 'undefined'){ // 更新数据
		console.log('update movie...');
		Movie.findById(id, function(err, movie){ 
			if(err){
				console.log(err);
			}
			_movie =  _.extend(movie, movieObj);// underscore 的 extend 新的字段movie替换老movieObj的字段
			_movie.save(function (err, movie){
				if(err){
					console.log(err);
				}
				res.redirect('/movie/'+ movie._id); // 重定向详情页
			});
		});
	}
	else{ // 添加数据
		console.log('add movie ...');
		_movie = new Movie({
			doctor: movieObj.doctor,
			title: movieObj.title,
			country: movieObj.country,
			language: movieObj.language,
			year: movieObj.year,
			poster: movieObj.poster,
			summary: movieObj.summary,
			flash: movieObj.flash
		});
		_movie.save(function (err, movie){
			if(err){
				console.log(err);
			}
			res.redirect('/movie/'+ movie._id); // 重定向详情页
		});
	}

};

// admin update movie
exports.update = function(req, res){
  var id = req.params.id;
  if (id) {
      Movie.findById(id, function (err, movie) {
          res.render('admin', {
              title: '电影 更新'+movie.title,
              movie: movie
          });
      });
  }
};

exports.new = function(req, res){
  res.render('admin', {title: '电影-后台录入页', movie: {
			doctor: '',
			country: '',
			title: '',
			year: '',
			poster: '',
			language: '',
			flash: '',
			summary: ''
      }
  });
};
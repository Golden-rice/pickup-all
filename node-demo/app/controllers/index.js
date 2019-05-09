require("babel-register");
require("./test.js");
var Movie = require('../models/movie.js'); 

exports.index = function(req, res){ 
	console.log('user session:'+req.session.user);

  Movie.fetch(function (err, movies) {
      if (err) {
          console.log(err);
      }
      res.render('index', {title:'电影-首页', movies: movies});
  });
};
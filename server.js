const http = require('http');
const fs   = require('fs');
const url  = require("url");
const querystring = require('querystring');

const hostname = 'localhost';
const port     = 8000;
const server   = http.createServer((req, res) => {
	var body,
			pathname = url.parse(req.url).pathname;

	req.on('data', function( chunk ){
		body += chunk;
	})

	req.on('end', function(){
		body = querystring.parse(body)
	})

	fs.readFile( pathname.substr(1), 'utf-8', function ( err, data ) { //读取内容
    if (err){
	    console.log(err);
			res.writeHead(404, {'Content-Type': 'text/html'});
    } else{
	    res.writeHead(200, {"Content-Type": "text/html"});
    }

    if(data){ res.write(data.toString()); }
    
    res.end();
	});

}).listen(port);

 console.log('Server running at http://'+hostname+':'+port);

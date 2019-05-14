/* Include static file webserver library */
var static = require('node-static');

/* Include http serverr library */
var http = require('http');

/*Assuming on heroku */
var port = process.env.PORT;
var directory = __dirname + '/public';

/* if we are not on heroku, need to readjust port and dir */

if(typeof port == 'undefined' || !port){
	directory = './public';
	port=8080;	
}

/* Setup a static web-server */

var file = new static.Server(directory);

var app = http.createServer(
	function(request,response){
		request.addListener('end',
			function(){
				file.serve(request,response);
			}
		).resume();
	}
).listen(port);

console.log('Server is running');

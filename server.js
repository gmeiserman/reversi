/* Set up the static file server */


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

/* set up the web socket server */

var io = require('socket.io').listen(app);

io.sockets.on('connection', function(socket){
	function log(){
		var array = ['*** Server log message: '];
		for(var i=0; i<arguments.length; i++){
			array.push(arguments[i]);
			console.log(arguments[i]);
		}
		socket.emit('log',array);
		socket.broadcast.emit('log',array);
	}
	
	log('A website connected to the server!');
	
	socket.on('disconnect', function(socket){
		log('A website disconnected from the server');
	});
        

	socket.on('join_room', function(payload){
                log('Server received a command', 'join_room',payload);
		if(('undefined' === typeof payload) || !payload){
			var error_message='join_room had no payload, command aborted';
			log(error_message);
			socket.emit('join_room_response', {
								result:'fail',
								message:error_message});
			return;
		}
		
		var room = payload.room;

		if(('undefined' === typeof room) || !room){
                        var error_message='join_room didn\'t specify room, command aborted';
                        log(error_message);
                        socket.emit('join_room_response', {
                                                                result:'fail',
                                                                message:error_message});
                        return;
                }
		
		var username=payload.username;	
		if(('undefined' === typeof username) || !username){
                        var error_message='join_room didn\'t specify username, command aborted';
                        log(error_message);
                        socket.emit('join_room_response', {
                                                                result:'fail',
                                                                message:error_message});
                        return;
                }

		socket.join(room);

		var roomObject=io.sockets.adapter.rooms[room];
                if(('undefined' === typeof roomObject) || !roomObject){
                        var error_message='join_room couldn\'t create a room (internal error), command aborted';
                        log(error_message);
                        socket.emit('join_room_response', {
                                                                result:'fail',
                                                                message:error_message});
                        return;
                }

		var numClients = roomObject.length;
		var success_data = {
					result: 'success',
					room: room,
					username: username,
					membership: (numClients + 1)
		};
		io.sockets.in(room).emit('join_room_response',success_data);
		log('Room '+ room + ' was just joined by ' + username);
        });
	

        socket.on('send_message', function(payload){
                log('Server received a command', 'send_message',payload);
                if(('undefined' === typeof payload) || !payload){
                        var error_message='send_message had no payload, command aborted';
                        log(error_message);
                        socket.emit('send_message_response', {
                                                                result:'fail',
                                                                message:error_message});
                        return;
                }

                var room = payload.room;
                if(('undefined' === typeof room) || !room){
                        var error_message='send_message didn\'t specify room, command aborted';
                        log(error_message);
                        socket.emit('send_message_response', {
                                                                result:'fail',
                                                                message:error_message});
                        return;
                }

                var username=payload.username;
                if(('undefined' === typeof username) || !username){
                        var error_message='send_message didn\'t specify username, command aborted';
                        log(error_message);
                        socket.emit('send_message_response', {
                                                                result:'fail',
                                                                message:error_message});
                        return;
                }
                
		var message=payload.message;
                if(('undefined' === typeof message) || !message){
                        var error_message='send_message didn\'t specify a message, command aborted';
                        log(error_message);
                        socket.emit('send_message_response', {
                                                                result:'fail',
                                                                message:error_message});
                        return;
                }
		
		var success_data= {
					result: 'success',
					room: room,
					username: username,
					message: message
				};
		io.socket.in(room).emit('send_message_response',success_data);
		log('Message sent to room ' + room + ' by ' + username);
	});

});

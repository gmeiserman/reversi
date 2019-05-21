/* functions for general use */

function getURLParameters(whichParam)
{
	var pageURL = window.location.search.substring(1);
	var pageURLVariables = pageURL.split('&');
	
	for (var i=0; i < pageURLVariables.length; i++){
		var parameterName = pageURLVariables[i].split('=');
		if(parameterName[0] == whichParam)
			return parameterName[1];
	}
}

var username = getURLParameters('username');
if ('undefined' == typeof username || !username)
{
	username = 'Anon_'+Math.random();
}

var chatroom='RoomOne';


/* Connect to the socket server */

var socket = io.connect();


socket.on('log', function(array){
	console.log.apply(console, array);
});

socket.on('join_room_response',function(payload){
        if(payload.result == 'fail'){
                alert(payload.message);
                return;
        }
        $('#messages').append('<p>New user joinded the room: '+payload.username+'</p>');
});

socket.on('send_message_response',function(payload){
        if(payload.result == 'fail'){
                alert(payload.message);
                return;
        }
        $('#messages').append('<p><b>'+payload.username+' says:</b> '+payload.message+'</p>');
});



function send_message(){
	var payload={};
	payload.room = chatroom;
        payload.username=username;
	payload.message=$('#send_message_holder').val();
	console.log('***Client log message: \'send_message\'  payload: '+JSON.stringify(payload));
	socket.emit('send_message'.payload);
}


$(function(){
	var payload={};
	payload.room = chatroom;
	payload.username=username;

	console.log('***Client log message: \'join_room\' payload: '+JSON.stringify(payload));
	socket.emit('join_room',payload);
});



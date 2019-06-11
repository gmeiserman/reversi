/*functions for general use*/

/* this function returns the value associated with 'whichParam' on the url */
function getURLParameters(whichParam){
	var pageURL = window.location.search.substring(1);
	var pageURLVariables = pageURL.split('&');
	for(var i=0; i<pageURLVariables.length;i++){
		var parameterName = pageURLVariables[i].split('=');
		if(parameterName[0] == whichParam){
			return parameterName[1];
		}
	}
}

var username = getURLParameters('username');
if('undefined' == typeof username || !username){
	username = 'Anonymous_'+Math.random();
}

var chat_room = getURLParameters('game_id');
if('undefined' == typeof chat_room || !chat_room){
        chat_room='lobby';
}

/* Connect to the socket server */
var socket = io.connect();

/*What to do when server sends log message */
socket.on('log',function(array){
	console.log.apply(console,array);
});

/*What to do when the server responds that someone joined a room*/
socket.on('join_room_response',function(payload){
	if(payload.result == 'fail'){
		alert(payload.message);
		return;
	}
	/*If we are being notified that we joined, then ignore it*/
	if(payload.socket_id == socket.id){
		return;
	}
	
	/* If someone joined, then add a new row to the lobby table */
	var dom_elements=$('.socket_'+payload.socket_id);
	/* If don't already have an entry for this person */
	if(dom_elements.length == 0){
		var nodeA= $('<div></div>');
		nodeA.addClass('socket_'+payload.socket_id);
		var nodeB= $('<div></div>');
		nodeB.addClass('socket_'+payload.socket_id)
		var nodeC= $('<div></div>');
		nodeC.addClass('socket_'+payload.socket_id)

		nodeA.addClass('w-100');

		nodeB.addClass('col-9 text-right');
		nodeB.append('<h4>'+payload.username+'</h4>');

		nodeC.addClass('col-3 text-left');
		var buttonC = makeInviteButton(payload.socket_id);
		nodeC.append(buttonC);

		nodeA.hide();
		nodeB.hide();
		nodeC.hide();

		$('#players').append(nodeA,nodeB,nodeC)
		nodeA.slideDown(1000);
		nodeB.slideDown(1000);
                nodeC.slideDown(1000);
	}else{
		uninvite(payload.socket_id);
		var buttonC = makeInviteButton(payload.socket_id);
		$('.socket_'+payload.socket_id+' button').replaceWith(buttonC);
		dom_elements.slideDown(1000);
	}


	/*Manage the message that a new player has joined */
	var newHTML='<p>' + payload.username+' just entered the lobby</p>';
	var newNode = $(newHTML);
	newNode.hide();
	$('#messages').append(newNode);
	newNode.slideDown(1000);

});

/* What to do when the server says someone has left a room */
socket.on('player_disconnected',function(payload){
        if(payload.result == 'fail'){
                alert(payload.message);
                return;
        }
        /*If we are being notified that we joined, then ignore it*/
        if(payload.socket_id == socket.id){
                return;
        }

        /* If someone left, then animate out all their content */
        var dom_elements=$('.socket_'+payload.socket_id);

        /* If something exists */
        if(dom_elements.length != 0){
                dom_elements.slideUp(1000);
        }


        /*Manage the message that a player has left */
        var newHTML='<p>' + payload.username+' has left the lobby</p>';
        var newNode = $(newHTML);
        newNode.hide();
        $('#messages').append(newNode);
        newNode.slideDown(1000);

});


function invite(who){
	var payload = {};
	payload.requested_user=who;

	console.log('***Client log message: \'invite\' payload: ' + JSON.stringify(payload));
	socket.emit('invite',payload);
}

socket.on('invite_response',function(payload){
        if(payload.result == 'fail'){
                alert(payload.message);
                return;
        }
	var newNode= makeInvitedButton(payload.socket_id);
	$('.socket_'+payload.socket_id+' button').replaceWith(newNode);

});

socket.on('invited',function(payload){
        if(payload.result == 'fail'){
                alert(payload.message);
                return;
        }
	var newNode= makePlayButton(payload.socket_id);
        $('.socket_'+payload.socket_id+' button').replaceWith(newNode);

});

/*Send an uninvite message to the server */
function uninvite(who){ 
        var payload = {};
        payload.requested_user=who;
        
        console.log('***Client log message: \'uninvite\' payload: ' + JSON.stringify(payload));
        socket.emit('uninvite',payload);
}

socket.on('uninvite_response',function(payload){
        if(payload.result == 'fail'){
                alert(payload.message);
                return;
        }
        var newNode= makeInviteButton(payload.socket_id);
        $('.socket_'+payload.socket_id+' button').replaceWith(newNode);

});

socket.on('uninvited',function(payload){
        if(payload.result == 'fail'){
                alert(payload.message);
                return;
        }
        var newNode= makeInviteButton(payload.socket_id);
        $('.socket_'+payload.socket_id+' button').replaceWith(newNode);

});

/*Send a game start message to the server */
function game_start(who){
        var payload = {};
        payload.requested_user=who;

        console.log('***Client log message: \'game_start\' payload: ' + JSON.stringify(payload));
        socket.emit('game_start',payload);
}

socket.on('game_start_response',function(payload){
        if(payload.result == 'fail'){
                alert(payload.message);
                return;
        }
        var newNode= makeEngagedButton(payload.socket_id);
        $('.socket_'+payload.socket_id+' button').replaceWith(newNode);

	/*Jump to a new page */
	window.location.href= 'game.html?username='+username+'&game_id='+payload.game_id;
});

function send_message(){
        var payload = {};
        payload.room = chat_room;
        payload.message = $('#send_message_holder').val();
        console.log('*** Client Log Message : \'send_message\' payload' + JSON.stringify(payload));
        socket.emit('send_message',payload);
        $('#send_message_holder').val('');
}

socket.on('send_message_response',function(payload){
	if(payload.result == 'fail'){
		alert(payload.message);
		return;
	}
	var newHTML= '<p><b>'+payload.username+' says:</b> '+payload.message+'</p>';
	var newNode = $(newHTML);
	newNode.hide();
	$('#messages').append(newNode);
	newNode.slideDown(1000);
});


function makeInviteButton(socket_id){
	var newHTML='<button type=\'button\' class=\'btn btn-outline-primary\'>Invite</button>';
	var newNode=$(newHTML);
	newNode.click(function(){
		invite(socket_id);
	});
	return(newNode);
}

function makeInvitedButton(socket_id){ 
        var newHTML='<button type=\'button\' class=\'btn btn-primary\'>Invited</button>';
        var newNode=$(newHTML);
	newNode.click(function(){
                uninvite(socket_id);
        });
        return(newNode);
}

function makePlayButton(socket_id){
        var newHTML='<button type=\'button\' class=\'btn btn-success\'>Play</button>';
        var newNode=$(newHTML);
	newNode.click(function(){
                game_start(socket_id);
        });

        return(newNode);
}

function makeEngagedButton(){
        var newHTML='<button type=\'button\' class=\'btn btn-danger\'>Engaged</button>';
        var newNode=$(newHTML);
        return(newNode);
}

$(function(){
	var payload = {};
	payload.room = chat_room;
	payload.username = username;
	console.log('*** Client Log Message : \'join_room\' payload' + JSON.stringify(payload));
	socket.emit('join_room',payload);
	
	$('#quit').append('<a href="lobby.html?username='+username+'" class="btn btn-danger btn-default active" role="button" aria-pressed="true">Quit</a>');
});

var old_board = [
									['?','?','?','?','?','?','?','?'],
									['?','?','?','?','?','?','?','?'],
									['?','?','?','?','?','?','?','?'],
									['?','?','?','?','?','?','?','?'],
									['?','?','?','?','?','?','?','?'],
									['?','?','?','?','?','?','?','?'],
									['?','?','?','?','?','?','?','?'],
									['?','?','?','?','?','?','?','?']
								];
var my_color= ' ';
var interval_timer;

socket.on('game_update',function(payload){
	console.log('*** Client Log Message : \'game_update\'\n\t payload' + JSON.stringify(payload));
	
	/*Check for a good board update*/
	if(payload.result == 'fail'){
		console.log(payload.message);
		window.location.href='lobby.html?username='+username;
		return;
	}
	
	/*Check for a good board in the payload*/
	var board = payload.game.board;
	if('undefined' == typeof board || !board){
		console.log('Internal error: received a malformed board update from the server');
		return;
	}
	
	/*Update my color*/
	if(socket.id == payload.game.player_white.socket){
		my_color= 'white';
	}else if(socket.id == payload.game.player_black.socket){
		my_color='black';
	}else{
		window.location.href = 'lobby.html?username=' + username;
		return;
	}
	
	var actualColor;
	if(my_color=='black'){
		$('#my_color').html('<h3 id="my_color">I am blue</h3>');
		actualColor='blue';
	}
	if(my_color=='white'){
		$('#my_color').html('<h3 id="my_color">I am grey</h3>');
		actualColor='grey';
	}
	
	var actualColor;
	
	if(payload.game.whose_turn==='black'){
		$('#my_color').append('<h4>It is blue\'s turn. Elapsed time <span id="elapsed"></span></h4>');
	}else if(payload.game.whose_turn==='white'){
		$('#my_color').append('<h4>It is grey\'s turn. Elapsed time <span id="elapsed"></span></h4>');
	}
	
	
	/*$('#my_color').html('<h3 id="my_color">I am '+my_color+'</h3>');*/
	
	
	clearInterval(interval_timer)
		interval_timer = setInterval(function(last_time){
			return function(){
				//Do the work of updating the UI
				var d = new Date();
				var elapsedmilli = d.getTime() - last_time;
				var minutes = Math.floor(elapsedmilli / (60*1000));
				var seconds = Math.floor((elapsedmilli % (60*1000))/ 1000);
				
				if(seconds < 10){
					$('#elapsed').html(minutes+':0'+seconds)
				}else{
					$('#elapsed').html(minutes+':'+seconds)
				}
				
			}}(payload.game.last_move_time)
		, 1000);
	
	/* Animate changes to the board */
	var row, column;
	
	var blacksum=0;
	var whitesum=0;
	
	for(row=0; row <8; row++){
		for(column=0; column <8; column++){
			if(board[row][column]=='b'){
			blacksum++;
			}
			if(board[row][column]=='w'){
			whitesum++;
			}
			/* If a board space has changed */
			if(old_board[row][column] != board[row][column]){
				if(old_board[row][column]=='?' && board[row][column] == ' '){
					$('#'+row+'_'+column).html('<img src="assets/images/blank.png" alt="empty square" />');
				}
				else if(old_board[row][column]=='?' && board[row][column] == 'w'){
					$('#'+row+'_'+column).html('<img src="assets/images/image_grey.png" alt="white square" />');
				}
				else if(old_board[row][column]=='?' && board[row][column] == 'b'){
					$('#'+row+'_'+column).html('<img src="assets/images/image_blue.png" alt="black square" />');
				}
				else if(old_board[row][column]==' ' && board[row][column] == 'w'){
					$('#'+row+'_'+column).html('<img src="assets/images/image_grey.png" alt="white square" />');
				}
				else if(old_board[row][column]==' ' && board[row][column] == 'b'){
					$('#'+row+'_'+column).html('<img src="assets/images/image_blue.png" alt="black square" />');
				}
				else if(old_board[row][column]=='w' && board[row][column] == ' '){
					$('#'+row+'_'+column).html('<img src="assets/images/blank.png" alt="blank square" />');
				}
				else if(old_board[row][column]=='b' && board[row][column] == ' '){
					$('#'+row+'_'+column).html('<img src="assets/images/blank.png" alt="blank square" />');
				}
				else if(old_board[row][column]=='w' && board[row][column] == 'b'){
					$('#'+row+'_'+column).html('<img src="assets/images/image_blue.png" alt="black square" />');
				}
				else if(old_board[row][column]=='b' && board[row][column] == 'w'){
					$('#'+row+'_'+column).html('<img src="assets/images/image_grey.png" alt="white square" />');
				}else{
					$('#'+row+'_'+column).html('<img src="assets/images/error.png" alt="error" />');
				}
				
			}
			
			
			/* set up interactivity when something has changed */
			$('#'+row+'_'+column).off('click');
			$('#'+row+'_'+column).removeClass('hovered_over');
			
			if(payload.game.whose_turn === my_color){
				if(payload.game.legal_moves[row][column] === my_color.substr(0,1)){
					$('#'+row+'_'+column).addClass('hovered_over');
					$('#'+row+'_'+column).click(function(r,c){
						return function(){
							var payload = {};
							payload.row = r;
							payload.column = c;
							payload.color = my_color;
							console.log('*** Client log message: \'play_token\' payload: ' +JSON.stringify(payload));
							socket.emit('play_token',payload);
						};
					}(row,column))
				}
				
			}
		}
	}
	
	$('#blacksum').html(blacksum);
	$('#whitesum').html(whitesum);
			old_board = board;	
});

socket.on('play_token_response',function(payload){
	console.log('*** Client Log Message : \'play_token_response\'\n\t payload' + JSON.stringify(payload));
	
	/*Check for a good play token response update*/
	if(payload.result == 'fail'){
		console.log(payload.message);
		alert(payload.message);
		return;
	}
});

/* Game over */
socket.on('game_over',function(payload){
	console.log('*** Client Log Message : \'game_over\'\n\t payload' + JSON.stringify(payload));
	
	/*Check for a good play token response update*/
	if(payload.result == 'fail'){
		console.log(payload.message);
		return;
	}
	
	/* Jump to a new page */
	var color;
	if(payload.who_won == 'black'){
		color = blue;
	}else if (payload.who_won == 'white'){
		color = white;
	}
	$('#game_over').html('<h1>Game Over</h1><h2>'+color+' won!</h2>');
	$('#game_over').append('<a href="lobby.html?username='+username+'" class="btn btn-success btn-lg active" role="button" aria-pressed="true">Return to lobby</a>');
});
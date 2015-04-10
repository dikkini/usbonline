/**
 * Created by dikkini on 3/21/15.
 */

$(document).on('ready', function() {
	var serverBaseUrl = document.href
		, socket = io.connect(serverBaseUrl)
		, sessionId = '';

	socket.on('connect', function () {
		sessionId = socket.io.engine.id;
		console.log("socket.io connected : " + sessionId);
		socket.emit('testSrv');
	});

	socket.on('testClient', function (data) {
		console.log(data.message);
	});

});


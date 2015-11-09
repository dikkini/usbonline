var io = require('socket.io')
	, log = require('../libs/log')(module)
	, clients = new Object();

function handler(socket) {
	var sessionId = (socket.id).toString().substr(0, 10);
	log.debug("New socket session: " + sessionId);
	var time = (new Date).toLocaleTimeString();
	log.debug("Add to array of clients");
	clients[sessionId] = socket;
	socket.json.send({'event': 'connected', 'name': sessionId, 'time': time});

	socket.on("launchapp", function (data) {
		socket.emit("launchapp", {
			port: data.port
		});
	});

	socket.on('end', function() {
		var sessionId = (socket.id).toString().substr(0, 10);
		log.debug("Socket end session: " + sessionId);
		delete clients[sessionId];
		log.debug("Delete client from array");
		socket.disconnect();
		log.debug("Disconnected");
	});
}

module.exports = {
	startServer: function(server) {
		log.debug("Start socket server");
		io.listen(server).on('connection', handler);
	},
	emit: function(sessionId, data) {
		log.debug("Socket emit with sessionId" + sessionId + ". Delete client and emit to client operation with data");
		log.debug("Socket Clients size BEFORE delete operation: " + clients.length);
		var socket = clients[sessionId];
		log.debug("Socket Clients size AFTER delete operation: " + clients.length);
		socket.emit(data.op, data);
	}
};
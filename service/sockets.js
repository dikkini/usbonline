var io = require('socket.io')
	, log = require('../libs/log')(module)
	, clients = new Object();

Object.size = function(obj) {
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
};

function handler(socket) {
	var sessionId = (socket.id).toString().substr(0, 10);
	log.debug("New socket session: " + sessionId);
	var time = (new Date).toLocaleTimeString();
	log.debug("Add to array of clients");
	clients[sessionId] = socket;
	log.debug("Socket clients size: " + Object.size(clients));
	socket.json.send({'event': 'connected', 'name': sessionId, 'time': time});

	socket.on("launchapp", function (data) {
		socket.emit("launchapp", {
			port: data.port
		});
	});

	socket.on('end', function() {
		var sessionId = (socket.id).toString().substr(0, 10);
		log.debug("Socket end session: " + sessionId);
		log.debug("Socket Clients size BEFORE delete operation: " + Object.size(clients));
		delete clients[sessionId];
		log.debug("Socket Clients size AFTER delete operation: " + Object.size(clients));
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
		log.debug("Socket emit with sessionId: " + sessionId + " . Emit to client operation with data");
		log.debug("Get socket from clients");
		var socket;
		if (clients.hasOwnProperty(sessionId)) {
			socket = clients[sessionId];
			log.debug("We got socket!")
		} else {
			log.error("There are no socket in clients.");
			for (var key in clients) {
				if (clients.hasOwnProperty(key)) {
					log.debug("KEY: " + key);
					log.debug("OBJ: " + clients[key]);
				} else {
					log.debug("No own prop for key: " + key);
				}
			}
			return false;
		}
		if (!socket) {
			log.error("Socket is empty.");
			return false;
		}
		log.debug("Socket: " + socket.id);
		socket.emit(data.op, data);
		return true;
	}
};
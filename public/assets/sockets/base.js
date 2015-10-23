/**
 * Created by dikkini on 3/21/15.
 */

module.exports = function (io) {
	io.on("connection", function(socket) {
		socket.on("testSrv", function (data) {
			console.log("socket.io OK!");
			io.sockets.emit("testClient", {message: "socket.io client OK!"});
		});
	});
};
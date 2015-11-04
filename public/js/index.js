/**
 * Created by dikkini on 3/21/15.
 */

$(document).on('ready', function() {
	var serverBaseUrl = document.href
		, socket = io.connect(serverBaseUrl)
		, sessionId = '';

	function init() {
		var $appUrl = $("#application-url");
		var ieVer = msieversion();
		if (ieVer == -1) {
			$appUrl.attr("href", "/download/application");
		}

		socket.on('connect', function () {
			sessionId = (socket.io.engine.id).toString().substr(0, 10);
			console.log("socket.io connected : " + sessionId);
		});

		socket.on('launchapp', function (data) {
			console.log(data);
		});
	}

	init();

});

$(window).unload(function() {
	var serverBaseUrl = document.href
		, socket = io.connect(serverBaseUrl);
	socket.emit("end");
});

function msieversion() {
	var ua = window.navigator.userAgent;
	var msie = ua.indexOf("MSIE ");

	if (msie > 0)      // If Internet Explorer, return version number
		alert(parseInt(ua.substring(msie + 5, ua.indexOf(".", msie))));
	else                 // If another browser, return 0
		alert('otherbrowser');

	alert(msie);
	return msie;
}


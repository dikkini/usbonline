$(document).ready(function() {
	var serverBaseUrl = document.href
		, socket = io.connect(serverBaseUrl)
		, sessionId = ''
		, canReload = false
		, isClickOnce = false;

	init();

	function init() {
		var $appUrl = $("#application-url");
		var isIE = isClientBrowserIE();
		if (isIE) {
			isClickOnce = true;
		} else {
			$appUrl.attr("href", "/download/application");
		}

		$("#isClickOnce").val(isClickOnce);

		socket.on('connect', function () {
			sessionId = (socket.io.engine.id).toString().substr(0, 10);
			if (isClickOnce) {
				var href = $appUrl.attr("href");
				href = href + "?sessionId=" + sessionId;
				$appUrl.attr("href", href);
			}
			console.log("socket.io connected : " + sessionId);
		});

		socket.on('launchapp', function (data) {
			console.log(data);
			startApp(data.port);
		});
	}

	$('body').on('click', "#launchApp", function() {
		var loadersJson = loadersToJson();
		if (isClickOnce) {
			var $appUrl = $("#application-url");
			var href = $appUrl.attr("href");
			href = href + "&loadersJson=" + JSON.stringify(loadersJson);
			canReload = true;
			window.location = href;
		}
	});

	function loadersToJson() {
		var loadersJson = [];
		$("#loader-list").children().not("#addLoaderBtn").each(function() {
			var loaderId = $(this).data("loader-id");
			var loaderSelect = $('select[data-loader-id="' + loaderId + '"]');
			var loaderSelectSelected = loaderSelect.find(':selected');
			var loaderCode = -1;
			loaderCode = loaderSelectSelected.data('code');

			var loader = {
				"id":loaderId,
				"code":loaderCode
			};
			loadersJson.push(loader);
		});

		return loadersJson;
	}

	function startApp(port) {
		var content = $("#right-content");
		// clear
		content.children().each(function() {
			$(this).remove();
		});

		var iframe = '<iframe id="smallAppIFrame" width="800" height="600" scrolling="no" frameborder="no" ' +
				'src="http://localhost:' + port + '"></iframe>';

		content.append(iframe);

		// TODO reload iframe unti server does not start
		reloadIFrame();
		setTimeout(function() {
			reloadIFrame();
		}, 5000);
	}

	function reloadIFrame() {
		$('#smallAppIFrame').attr('src', function ( i, val ) {
			return val;
		});
	}

	function isClientBrowserIE() {
		// detect IE11
		if (Object.hasOwnProperty.call(window, "ActiveXObject") && !window.ActiveXObject) {
			return true;
		}
		var ua = window.navigator.userAgent;

		// detect Edge
		var ieEdge = /(Edge\/\d+)/i;
		if (ua.match(ieEdge)) {
			return true;
		}

		// detect older than IE11
		var msie = ua.indexOf("MSIE ");

		// other browsers would be -1
		return msie > 0;

		//if (msie > 0)      // If Internet Explorer, return version number
		//	alert(parseInt(ua.substring(msie + 5, ua.indexOf(".", msie))));
		//else                 // If another browser, return 0
		//	alert('otherbrowser');
	}

	function goodbye(e) {
		if (!canReload) {
			if (!e) e = window.event;
			//e.cancelBubble is supported by IE - this will kill the bubbling process.
			e.cancelBubble = true;

			//This is displayed on the dialog
			e.returnValue = 'If you leave of refresh page, you have to start your process again! Are you sure?';

			//e.stopPropagation works in Firefox.
			if (e.stopPropagation) {
				e.stopPropagation();
				e.preventDefault();
			}

			// for IE, do not show alert dialog twice
			canReload = true;
			setTimeout(function() {
				canReload = false;
			}, 100);
		}
	}
	window.onbeforeunload=goodbye;
});

$(window).unload(function() {
	var serverBaseUrl = document.href
		, socket = io.connect(serverBaseUrl);
	socket.emit("end");
});

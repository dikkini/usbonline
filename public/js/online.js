$(document).ready(function() {

	'use strict';

	$("#online-navigation").addClass("active");

	var serverBaseUrl = window.location.protocol + "//" + window.location.host
		, sessionId = ''
		, canReload = true
		, launchApp = false
		, $body = $("body")
		, isClickOnce = false;

	var socket = io.connect(serverBaseUrl, {'sync disconnect on unload' : true});

	$.blockUI.defaults.message = '<h3><img height=50 src="/assets/small_ui/img/loading.gif" /> Please wait...</h3>';

	var $appUrl = $("#application-url");
	var isIE = isClientBrowserIE();
	if (isIE) {
		isClickOnce = true;
	} else {
		$("#loader-list").remove();
		$("#howto-block").remove();
		$appUrl.attr("href", "/download/online");
		$.blockUI.defaults.message = '<h3><img height=50 src="/assets/small_ui/img/loading.gif" /> Do not close this page! Launch BootLine.exe and back to this page.</h3>';
	}
	$appUrl.hide();

	$("#isClickOnce").val(isClickOnce);

	socket.on('connect', function () {
		sessionId = (socket.io.engine.id).toString().substr(0, 10);
		var href = $appUrl.attr("href");
		href = href + "?sessionId=" + sessionId;
		$appUrl.attr("href", href);
	});

	socket.on('launchapp', function (data) {
		startApp(data.port);
	});

	$(".circular").colorbox({
		rel: "circular",
		scrolling: false
	});

	$body.on('click', "#launchApp", function() {
		$.blockUI();
		$.ajax({
			url: "/utils/startappbtn",
			type: "POST",
			dataType: "JSON",
			data: {
				IE:isIE
			},
			async: false,
			success: function (response) {},
			error: function (response) {}
		});
		var $appUrl = $("#application-url");
		var href = $appUrl.attr("href");
		if (isClickOnce) {
			var loadersJson = loaderCodes();
			href = href + "&loadersJson=" + loadersJson;
		}
		canReload = true;
		launchApp = true;
		window.location.href = href;

		setTimeout(function() {
			canReload = false;
		}, 3000)
	});

	function loaderCodes() {
		var loaderCodes = "null";
		$(".loader-item").each(function() {
			var loaderId = $(this).data("loader-id");
			var loaderSelect = $('select[data-loader-id="' + loaderId + '"]');
			var loaderSelectSelected = loaderSelect.find(':selected');
			var loaderCode = -1;
			loaderCode = loaderSelectSelected.data('code');
			if (loaderCodes == "null") {
				loaderCodes = "";
			}
			loaderCodes += loaderCode;
			loaderCodes += ",";
		});
		if (loaderCodes != "null") {
			loaderCodes = loaderCodes.substring(0, loaderCodes.length - 1);
		}

		return loaderCodes;
	}

	function pageY(elem) {
		return elem.offsetParent ? (elem.offsetTop + pageY(elem.offsetParent)) : elem.offsetTop;
	}

	function resizeIframe() {
		var height = $("section#app").height();
		document.getElementById('smallAppIFrame').style.height = height + 'px';
	}

	$body.on("click", "#debug", function() {
		startApp("1792");
	});

	function startApp(port) {
		var content = $("#page-content");
		content.empty();
		content.removeClass("row");
		$body.css({"padding-left": "0", "padding-right": "0"});
		$("#header").remove();
		$("section#app").css({"margin-top": "-2px", "margin-bottom": "0", "padding-top": "0", "padding-bottom": "0"});

		var iframe = '<iframe id="smallAppIFrame" width="100%" height="600px" scrolling="no" frameborder="no" ' +
				'src="http://localhost:' + port + '"></iframe>';

		content.append(iframe);

		resizeIframe();

		// .onload doesn't work with IE8 and older.
		if (iframe.attachEvent) {
			iframe.attachEvent("onload", resizeIframe);
		}

		window.onresize = resizeIframe;

		scroll.call($body, 0, this);

		$.unblockUI();
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

	function onBeforeUnload(e) {
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
			}, 500);
		}
	}
	window.onbeforeunload=onBeforeUnload;


	$body.on('click', '#addLoaderBtn', function() {
		if ($(this).hasClass("disabled")) {
			return false;
		}
		var id = generateUUID();
		addLoaderToDOM(id);
	});

	var ALL_LOADERS_COUNT = 0;

	var $addLoaderBtn = $("#addLoaderBtn");

	var wHeight = document.documentElement.clientHeight - $("section#app").height();
	$("#loader-list").css({"height":wHeight});
	$(window).on('resize', function() {
		var wHeight = $("section#app").height();
		$("#loader-list").css({"height":wHeight});
	});


	function addLoaderToDOM(id) {
		var loaderItem = buildLoaderItem(id);
		var $loaderList = $("#loader-list");
		var $col = $("<div>", {class:"col-lg-6","style":"padding-bottom:10px;"});

		var $container;
		// because build loader item function plus one inside but there are no loader actually till now
		ALL_LOADERS_COUNT -= 1;
		if (ALL_LOADERS_COUNT % 2 == 0) {
			$container = $loaderList.children().last();

			$col.append(loaderItem);
			$container.prepend($col);
			$col.hide().fadeIn('slow');
		} else {
			$container = $loaderList.children().last();
			var $loaderColLg6 = $container.children().last();
			$loaderColLg6.empty();
			$loaderColLg6.append(loaderItem).hide().fadeIn('slow');

			var $row = $("<div>", {class:"row loader-row", "style":"padding-bottom:10px;"});
			$col.append($addLoaderBtn);
			$row.append($col);

			$loaderList.append($row);
		}

		var height = $loaderList[0].scrollHeight ? $loaderList[0].scrollHeight : 0;
		scroll.call($loaderList, height, this);
		ALL_LOADERS_COUNT += 1;
	}

	$body.on("click", "span.loader-action-remcancel", function() {
		var loaderId = $(this).data("loader-id");
		var $loaderList = $("#loader-list");
		var $loader = $loaderList.find('.loader-item[data-loader-id="' + loaderId + '"]');

		$loader.fadeOut(100, function() {
			$(this).remove();
			if (ALL_LOADERS_COUNT == 0) {
				$loaderList.empty();
			}

			var cnt = 0;
			var $row = $("<div>", {class: "row loader-row"});
			$(".loader-item").each(function () {
				if (cnt == 0) {
					$loaderList.empty();
				}
				cnt += 1;
				if (cnt == 3) {
					cnt = 1;
					$loaderList.append($row);
					$row = $("<div>", {class: "row loader-row"});
				}
				var $col = $("<div>", {class: "col-xs-6"});
				$col.append($(this));
				$row.append($col);
			});

			if (cnt > 0) {
				$loaderList.append($row);
			}

			var $col = $("<div>", {class: "col-xs-6"});
			if (ALL_LOADERS_COUNT % 2 == 0) {
				var $row = $("<div>", {class: "row loader-row"});
				$col.append($addLoaderBtn);
				$row.append($col);
				$loaderList.append($row);
				$row.hide();
				$row.fadeIn(200);
			} else {
				var $container = $loaderList.children().last();
				$col.append($addLoaderBtn);
				$container.append($col);
				$addLoaderBtn.hide();
				$addLoaderBtn.fadeIn(200);
			}
		});

		ALL_LOADERS_COUNT -= 1;
	});

	function buildLoaderItem(loaderId) {
		ALL_LOADERS_COUNT += 1;
		var template =
				_.template(
					'<div data-loader-id="<%= loaderId %>" class="loader-item trian box-shadow">' +
						'<span data-loader-id="<%= loaderId %>" title="Delete or cancel burning" class="loader-action-remcancel glyphicon glyphicon-remove" aria-hidden="true"></span>' +
						'<h4 data-loader-id="<%= loaderId %>" class="loader-status-value" data-code="0"> Waiting... </h4>' +
						'<div class="loader-interface">' +
							'<select data-loader-id="<%= loaderId %>" class="loader-type-select form-control input-sm">' +
								'<option value="windows7" data-code="0" data-url="https://msdn.microsoft.com/ru-ru/subscriptions/downloads/hh442898.aspx">Windows 7</option>' +
								'<option value="windows8" data-code="1" data-url="https://msdn.microsoft.com/ru-ru/subscriptions/downloads/hh442898.aspx">Windows 8</option>' +
								'<option value="windows10" data-code="2" data-url="https://msdn.microsoft.com/ru-ru/subscriptions/downloads/hh442898.aspx">Windows 10</option>' +
								'<option value="kav" data-code="3" data-url="http://support.kaspersky.ru/4162">Kasperksy Rescue Disk</option>' +
								'<option value="avg" data-code="4" data-url="http://www.avg.com/dk-en/download.prd-arl">AVG Rescue Disk</option>' +
								'<option value="ubuntu" data-code="5" data-url="http://www.ubuntu.com/download/desktop">Ubuntu Linux</option>' +
								'<option value="hiren" data-code="6" data-url="http://www.hiren.info/pages/bootcd">Hiren\'s Boot CD</option>' +
								'<option value="parted" data-code="7" data-url="http://partedmagic.com/downloads/">Parted Magic</option>' +
								'<option value="drweb" data-code="8" data-url="http://www.freedrweb.com/livedisk/">Dr. Web Live Disk</option>' +
								'<option value="clonezilla" data-code="9" data-url="http://clonezilla.org/downloads.php">CloneZilla Live</option>' +
							'</select>' +
						'</div>' +
						'<div data-loader-id="<%= loaderId %>" class="loader-information"></div>' +
						'<div data-loader-id="<%= loaderId %>" class="progress">' +
							'<div data-loader-id="<%= loaderId %>" class="progress-bar burning-progress" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;">' +
								'0%' +
							'</div>' +
						'</div>' +
					'</div>');

		return template({loaderId:loaderId});
	}
});

$(document).ready(function() {
	'use strict';

	var ALL_LOADERS_COUNT = 0;

	var SESSIONID;

	var $flashDriveList = $("#flash-drives-list");
	var $body = $("body");
	var $burnBtn = $("#burnBtn");
	var $refreshDrivesBtn = $("#refreshFlashDrives");
	var $addLoaderBtn = $("#addLoaderBtn");

	var MODE_NONE = "Type";
	var MODE_CURRENT = MODE_NONE;
	var MODE_NEW = "New";
	var MODE_ADD = "Add";
	var ISWORKING = false;
	var dontBlock = false;

	var LOADER_STATUS_WAIT = 0;
	var LOADER_STATUS_CANCELLED = 1;
	var LOADER_STATUS_FINISHED = 2;
	var LOADER_STATUS_WORKING = 3;

	var selectedFlashDrive = -1;

	var ERROR_ALL_LOADERS_SIZE = false;

	var isAppRuning = $("#isAppRunning").val();
	if (isAppRuning) {
		$( document ).tooltip();
		var successCb = function(response) {
			SESSIONID = response.SessionUID;
			var successCb = function (response) {
				var loadersJson = response.ExistLoaders;
				if (loadersJson == "null") {
					init();
					return;
				} else if (!loadersJson) {
					init();
					return;
				}
				loadersJson = loadersJson.split(",");
				renderLoadersJson(loadersJson);
				init();
			};
			var errorCb = function (response) {
				alert(response);
			};
			getLoadersJson(true, successCb, errorCb);
		};
		var errorCb = function(response) {
			alert(response);
		};
		getSessionId(true, successCb, errorCb);
	}

	function init() {
		$.blockUI.defaults.fadeIn = 0;
		$.blockUI.defaults.fadeOut = 0;
		$.blockUI.defaults.message = '<h3><img height=50 src="http://bootline.net/assets/small_ui/img/loading.gif" /> Please wait...</h3>';

		$(document).ajaxStart(function () {
			if (!dontBlock)
				$.blockUI();
		}).ajaxStop($.unblockUI);

		$.blockUI();

		var wHeight = $(window).height() - 100;
		$("#loader-list").css({"height":wHeight});

		saveUserInfo();

		disableInterface();
		renderFlashDrives();
	}

	$(window).resize(function(){
		var width = $(window).width();
		var height = $(window).height();
		$("#loader-list").css({"height":height-100});
	});

	$body.on("click", "#refreshFlashDrives", function() {
		selectedFlashDrive = -1;
		$flashDriveList.children().each(function() {
			$(this).remove();
		});
		disableInterface();
		renderFlashDrives();
	});

	$body.on('click', '.flash-drive-item', function() {
		var fd = $(this).attr("value");
		selectedFlashDrive = $.parseJSON(fd);

		$flashDriveList.children().each(function() {
			$(this).removeClass("active");
		});
		$(this).addClass("active");

		var value = getFlashDriveFilledSpace(selectedFlashDrive);

		$(".loader-item").each(function () {
			var loaderId = $(this).data("loader-id");
			var loaderISO = $('.loader-iso[data-loader-id="' + loaderId + '"]');
			var loaderISOPath = loaderISO.data("loader-iso-path");
			var loaderISOSize = loaderISO.data("loader-iso-size");

			value += loaderISOSize;
		});

		value = isoSizeToPerc(selectedFlashDrive, value);
		calcFlashDriveSize(value);
	});

	$body.on("click", "button,input", function(){
		var border = $(this).css('border-color');
		// fucking IE
		if (border == "") {
			border = $(this).css('border-top-color');
		}
		if (border == "rgb(255, 0, 0)") {
			$(this).css({'border-color': ''});
		}
	});

	$burnBtn.click(function() {
		if (selectedFlashDrive == -1) {
			$.growlUI('Error', 'Choose flash drive from the list firstly!');
			return;
		}

		if (ERROR_ALL_LOADERS_SIZE) {
			$.growlUI('Error', 'We can\'t burn all loaders because their size more than capacity of your flash drive. ' +
					'Choose other flash drive or remove some loaders');
			return;
		}
		var loaderList = collectLoaders();

		if (loaderList == "") {
			return;
		}
		var mode = $("#formatFlashDriveCb").prop('checked');

		if (mode) {
			mode = "New";
		} else {
			mode = "Add";
		}

		for (var i = 0; i<loaderList.length; i++) {
			var loader = loaderList[i];
			disableLoaderInterface(loader.Name);
		}

		var successCb = function(response) {
			disableInterface();
			$('.loader-action-remcancel').hide();
			launchBurningProgressProcess();
		};

		var errorCb = function(response) {
			alert(response);
		};

		burnFlashDrive(loaderList, mode, selectedFlashDrive.Letter, true, successCb, errorCb);
	});

	$body.on("click", "button.loader-action-linktoiso", function() {
		var loaderId = $(this).data('loader-id');
		var loaderSelect = $('select[data-loader-id="' + loaderId + '"]');
		var loaderSelectSelected = loaderSelect.find(':selected');
		var url = loaderSelectSelected.data('url');

		var win = window.open(url, '_blank');
		win.focus();
	});

	$body.on("click", "span.loader-action-remcancel", function() {
		var loaderId = $(this).data("loader-id");
		if (ISWORKING) {
			var $that = $(this);
			$('.loader-status-value[data-loader-id="' + loaderId + '"]').attr("data-code", LOADER_STATUS_CANCELLED);
			var successCb = function(response) {
				// Jobs not started
				if (response.Error) {
					return;
				}
				$that.remove();
				$('.loader-status-value[data-loader-id="' + loaderId + '"]').text("Cancelling... Rolling back...");
				var $loaderIso = $('.loader-iso[data-loader-id="' + loaderId + '"]');
				var loaderIsoSizePerc = $loaderIso.data("loader-iso-size-percent");
				if (loaderIsoSizePerc) {
					var currentWidth = getCurrentWidthInPercent();
					currentWidth -= loaderIsoSizePerc;
					calcFlashDriveSize(currentWidth);
				}
			};
			var errorCb = function(response) {
				alert(response);
			};
			cancelLoader(true, successCb, errorCb);
		} else {
			var $loaderList = $("#loader-list");
			var $loader = $loaderList.find('.loader-item[data-loader-id="' + loaderId + '"]');
			var $loaderIso = $('.loader-iso[data-loader-id="' + loaderId + '"]');
			var loaderIsoSizePerc = $loaderIso.data("loader-iso-size-percent");
			if (loaderIsoSizePerc) {
				var currentWidth = getCurrentWidthInPercent();
				currentWidth -= loaderIsoSizePerc;
				calcFlashDriveSize(currentWidth);
			}

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
		}
	});


	$body.on("change", "select.loader-type-select", function() {
		var loaderId = $(this).data("loader-id");
		var iso = $('.loader-iso[data-loader-id="' + loaderId + '"]');
		var isoSizePercent = iso.data("loader-iso-size-percent");
		var currentWidth = getCurrentWidthInPercent();
		if (isoSizePercent) {
			iso.remove();
			currentWidth -= isoSizePercent;
		}
		calcFlashDriveSize(currentWidth, true);
	});

	$body.on('click', '.loader-action-chooseiso', function() {
		if (selectedFlashDrive == -1) {
			$.growlUI('Error', 'Choose flash drive firstly!');
			return;
		}
		var loaderId = $(this).data('loader-id');
		var loaderSelect = $('select[data-loader-id="' + loaderId + '"]');
		var loaderSelectSelected = loaderSelect.find(':selected');
		var loaderCode = loaderSelectSelected.data('code');
		var successCb = function(response) {
			if (response.Error) {
				if (response.Error != "Dialog cancelled") {
					alert("Internal server error. Please contact to a support. Error: " + response.Error);
				}
				// TODO
				return;
			}

			var currentWidth = getCurrentWidthInPercent();
			var prevIso = $('.loader-iso[data-loader-id="' + loaderId + '"]');
			var prevIsoSizePercent = prevIso.data("loader-iso-size-percent");
			if (prevIsoSizePercent) {
				prevIso.remove();
				currentWidth -= prevIsoSizePercent;
			}
			var path = response.Path;
			var size = parseInt(response.Size);
			var sizeMb = Math.round(size / 1000000);
			var sizePerc = isoSizeToPerc(selectedFlashDrive, size);
			currentWidth += sizePerc;
			var isSet = calcFlashDriveSize(currentWidth, true);

			if (isSet) {
				var label = $('<label>', {
					class: "loader-iso",
					"data-loader-id": loaderId,
					"data-loader-iso-path": path,
					"data-loader-iso-size-percent": sizePerc,
					"data-loader-iso-size": size,
					"title": path + " " + sizeMb + " MiB",
					text: path + " " + sizeMb + " MiB"
				});

				$('.loader-information[data-loader-id="' + loaderId + '"]').append(label)
			}
		};

		var errorCb = function (response) {
			alert(response);
		};

		openBrowseDialog("Window title", loaderCode, successCb, errorCb)
	});

	$body.on('click', '#addLoaderBtn', function() {
		if ($(this).hasClass("disabled")) {
			return false;
		}
		var id = generateUUID();
		addLoaderToDOM(id);
	});

	$("#showFlashDrives").click(function() {
		$flashDriveList.slideToggle(500);
		var isShow = $(this).data("show");
		if (isShow == true) {
			$(this).data("show", false);
			$(this).html("<strong>Show Flash Drives</strong>");
		} else {
			$(this).data("show", true);
			$(this).html("<strong>Hide Flash Drives</strong>");
		}
	});

	$("#send-feedback").click(function() {
		var email = $("#feedback-email").val();
		var feedback = $("#feedback-text").val();
		$("#feedback-modal").modal("hide");
		dontBlock = true;

		$.ajax({
			url: "http://bootline.net/utils/feedback",
			type: "POST",
			dataType: "JSON",
			data: {
				"email": email,
				"feedback": feedback,
				"sessionId": SESSIONID
			},
			async: true,
			success: function (response) {
				alert("Thank you! You opinion very important to us!");
			},
			error: function (response) {
			}
		});
	});

	function renderFlashDrives() {
		var successCb = function(response) {
			var fdList = $("#flash-drives-list");
			var drives = response.Drives;
			if (!drives) {
				$refreshDrivesBtn.removeAttr("disabled");
				$.unblockUI();
				return;
			}
			for (var i = 0; i < drives.length; i++) {
				var drive = drives[i];
				var html = "<a href='#' value='" + JSON.stringify(drive) + "' class='list-group-item flash-drive-item'>" +
								"<h4 class='list-group-item-heading'>" + drive.Name + '</h4>' +
								"<p class='list-group-item-text'>(" + drive.Letter.toUpperCase() + ":\\" + ") " + drive.FS + "</p>" +
						    	"<p class='list-group-item-text'>FreeSpace:" + Math.round(parseInt(drive.FreeSpace) / (1024*1024)) + "Mb</p>" +
								"<p class='list-group-item-text'>FullSize: " + Math.round(parseInt(drive.FullSize) / (1024*1024)) + "Mb</p>" +

							'</a>';
				fdList.append(html);
			}
			enableInterface();
			$.unblockUI();
		};
		var errorCb = function(response) {
			alert(response);
			$("#refreshFlashDrives").removeAttr("disabled");
		};
		getFlashDrives(true, successCb, errorCb);
	}

	var burningProgressMessages;
	function launchBurningProgressProcess() {
		var successCb = function(response) {
			ISWORKING = true;
			var messages = response.NewMessages;
			if (!messages) {
				return;
			}
			for (var i = 0; i < messages.length; i++) {
				var msg = messages[i];
				var progressValue = msg.MsgTextFst; // Progress=Integer
				var loaderId = msg.MsgTextFrth; // Name=LoaderId
				var status = msg.MsgTextScnd; // Status=Running
				var type = msg.MsgType; // "JobSync"

				if (type == "JobSync" && status == "Initializing") {
					$('.loader-status-value[data-loader-id="' + loaderId + '"]').attr("data-code", LOADER_STATUS_WORKING);
					$('.loader-action-remcancel[data-loader-id="' + loaderId + '"]').show();
				}

				if (type == "BurnFinished") {
					ISWORKING = false;
					enableInterface();
					clearInterval(burningProgressMessages);
					return;
				}

				if (type == "JobFinished") {
					$('.loader-action-remcancel[data-loader-id="' + loaderId + '"]').remove();
					$('.loader-status-value[data-loader-id="' + loaderId + '"]').attr("data-code", LOADER_STATUS_FINISHED);
				}

				if (progressValue == "Format") {
					$.growlUI('Info', 'Formatting flash Drive');
					continue;
				}

				var $loaderItem = $("#loader-list").find('.loader-item[data-loader-id="' + loaderId + '"]');
				var $progressBar = $loaderItem.find('.progress-bar[data-loader-id="' + loaderId + '"]');
				$progressBar.css("width", progressValue + "%").attr("aria-valuenow", progressValue);
				$progressBar.text(progressValue + "%");
				$loaderItem.find('.loader-status-value[data-loader-id="' + loaderId + '"]').text(" " + status);
			}
		};

		var errorCb = function(response) {
			alert(response);
		};

		burningProgressMessages = setInterval(function(){
			getLoaderBurningProgress(true, successCb, errorCb);
		}, 1000);
	}

	function disableLoaderInterface(loaderId) {
		var loaders = $("#loader-list").find('.loader-item[data-loader-id="' + loaderId + '"]');
		loaders.find("input, button").not(".loader-action-minimize, .loader-action-linktoiso").attr("disabled", "disabled");
		loaders.find("select").prop('disabled', 'disabled');
	}

	function disableInterface() {
		$refreshDrivesBtn.attr("disabled", "disabled");
		$flashDriveList.children().each(function() {
			$(this).addClass("disabled");
			$(this).attr("disabled", "disabled");
		});
		$addLoaderBtn.attr("disabled", "disabled");
		$burnBtn.attr("disabled", "disabled");
	}

	function enableInterface() {
		$refreshDrivesBtn.removeAttr("disabled");
		$flashDriveList.children().each(function() {
			$(this).removeClass("disabled");
			$(this).removeAttr("disabled");
		});
		$addLoaderBtn.removeAttr("disabled");
		$burnBtn.removeAttr("disabled");
	}

	function calcFlashDriveSize(widthInPerc) {
		var $progressBar = $("#flashDriveSizeBarGreen");

		if (widthInPerc > 80 && widthInPerc < 98) {
			$.growlUI('Error', 'Your flash drive has more than 80% capacity filled. Be carefully.');
			ERROR_ALL_LOADERS_SIZE = false;
		} else if (widthInPerc > 98) {
			$.growlUI('Error', 'Your flash drive has more than 98% capacity filled. We can\'t burn this loader.');
			ERROR_ALL_LOADERS_SIZE = true;
		} else {
			ERROR_ALL_LOADERS_SIZE = false;
		}
		$progressBar.width(widthInPerc+"%");
		$progressBar.text(widthInPerc+"%");
		return true;
	}

	function collectLoaders() {
		var loaderList = [];
		var error = false;
		$(".loader-item").each(function () {
			var loaderId = $(this).data("loader-id");
			var loaderISO = $('.loader-iso[data-loader-id="' + loaderId + '"]');
			var loaderISOPath = loaderISO.data("loader-iso-path");
			var loaderISOSize = loaderISO.data("loader-iso-size");
			if (!loaderISOPath || !loaderISOSize) {
				$('.loader-action-chooseiso[data-loader-id="' + loaderId + '"]').css({'border-color': 'red'});
				$.growlUI('Error', 'Choose ISO Path for loader!');
				error = true;
				return;
			}
			var loaderSelect = $('select[data-loader-id="' + loaderId + '"]');
			var loaderSelectSelected = loaderSelect.find(':selected');
			var loaderCode = -1;
			loaderCode = loaderSelectSelected.data('code');
			if (loaderCode == -1) {
				$('.loader-type-select[data-loader-id="' + loaderId + '"]').css({'border-color': 'red'});
				$.growlUI('Error', 'Choose loader type!');
				error = true;
				return;
			}
			var loaderStatusCode = $('.loader-status-value[data-loader-id="' + loaderId + '"]').attr("data-code");
			if (loaderStatusCode != LOADER_STATUS_WAIT) {
				return true;
			}
			var loader = {
				Name: loaderId,
				Path: loaderISOPath,
				Code: loaderCode,
				Size: loaderISOSize
			};
			loaderList.push(loader);
		});
		if (error) {
			return "";
		} else if (loaderList.length == 0) {
			$.growlUI('Error', 'Add at least one loader!');
			return "";
		}
		return loaderList;
	}

	function getCurrentWidthInPercent() {
		var widthPerc = $("#flashDriveSizeBarGreen").text().slice(0, -1);
		return parseInt(widthPerc);
	}

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

	function renderLoadersJson(loadersJson) {
		for (var i = 0; i<loadersJson.length; i++) {
			var loaderId = generateUUID();
			var loaderCode = loadersJson[i];
			//console.log(loaderId);
			//console.log(loaderCode);
			addLoaderToDOM(loaderId);
			var loaderSelect = $('select[data-loader-id="' + loaderId + '"]');
			var loaderSelectOption = loaderSelect.find('option[data-code="' + loaderCode + '"]');
			loaderSelectOption.prop('selected', true);
		}
	}

	function buildLoaderItem(loaderId) {
		ALL_LOADERS_COUNT += 1;
		var template =
			_.template(
				'<div data-loader-id="<%= loaderId %>" class="loader-item trian box-shadow">' +
					'<span data-loader-id="<%= loaderId %>" title="Delete or cancel burning" class="loader-action-remcancel glyphicon glyphicon-remove" aria-hidden="true">' +
					'</span>' +
					'<h4 data-loader-id="<%= loaderId %>" class="loader-status-value" data-code="0"> Waiting... </h4>' +
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
					'<button data-loader-id="<%= loaderId %>" title="Choose ISO file from filesystem" type="button" class="loader-action-chooseiso btn btn-default">' +
						'<span class="glyphicon glyphicon-search" aria-hidden="true"></span>' +
					'</button>' +
					'<button data-loader-id="<%= loaderId %>" title="Open site of chosen loader in a new tab" type="button" class="loader-action-linktoiso btn btn-default">' +
						'<span class="glyphicon glyphicon-new-window" aria-hidden="true"></span>' +
					'</button>' +
					'<div data-loader-id="<%= loaderId %>" class="loader-information"></div>' +
					'<div data-loader-id="<%= loaderId %>" class="progress">' +
						'<div data-loader-id="<%= loaderId %>" class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;">' +
							'0%' +
						'</div>' +
					'</div>' +
				'</div>');

		return template({loaderId:loaderId});
	}

	function saveUserInfo() {
		//Application Code Name
		var codeName = navigator.appCodeName;
		//Application Name
		var appName = navigator.appName;
		//Application Version
		var appVersion = navigator.appVersion;
		//User Language and Language
		var language = navigator.language;
		//Platform
		var platform = navigator.platform;
		//User Agent
		var userAgent = navigator.userAgent;
		//Java Enabled
		var javaEnabled = navigator.javaEnabled();
		//To check cookies are enabled in the browser.
		var cookiesEnabled = navigator.cookieEnabled;
		//Browser Version
		var version = parseInt(navigator.appVersion,10);

		$.ajax({
			url: "http://bootline.net/utils/userinfo",
			type: "POST",
			dataType: "JSON",
			data: {
				"sessionId": SESSIONID,
				"codeName": codeName,
				"appName": appName,
				"appVersion": appVersion,
				"language": language,
				"platform": platform,
				"userAgent": userAgent,
				"javaEnabled": javaEnabled,
				"cookiesEnabled": cookiesEnabled,
				"version": version
			},
			async: true,
			success: function (response) {
			},
			error: function (response) {
			}
		});
	}

	//$(window).unload(function() {
	//	if (isAppRuning) {
	//		shutdownServer();
	//		window.location = '/';
	//	}
	//});

});
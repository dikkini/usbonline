$(document).ready(function() {
	'use strict';

	var isAppRuning = $("#isAppRunning").val();
	if (isAppRuning) {
		getSessionId();
	}

	function init() {
		$.blockUI.defaults.fadeIn = 0;
		$.blockUI.defaults.fadeOut = 0;
		$.blockUI.defaults.message = '<h3><img height=50 src="http://77.221.146.148/assets/small_ui/img/loading.gif" /> Please wait...</h3>';

		$(document).ajaxStart(function () {
			if (!dontBlock)
				$.blockUI();
		}).ajaxStop($.unblockUI);

		saveUserInfo();

		renderFlashDrives();
	}

	var SESSIONID;

	var $burnTypeSelect = $("#burnTypeSelectBtn");
	var $burnTypeSelectUL = $("#burnTypeSelectUL");
	var $flashDriveSelectBtn = $("#flashDriveSelectBtn");
	var $flashDriveSelectUL = $("#flashDriveSelectUl");
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

	var selectedFlashDrive = -1;

	$burnBtn.click(function() {
		var loaderList = collectLoaders();
		
		if (loaderList == "") {
			return;
		}
		var mode = $burnTypeSelect.text().trim();
		if (mode == MODE_NONE) {
			$burnTypeSelect.css({'border-color': 'red'});
			$.growlUI('Error', 'Choose type flash drive burn!');
			return;
		}

		for (var i = 0; i<loaderList.length; i++) {
			var loader = loaderList[i];
			disableLoaderInterface(loader.Name);
		}

		var successCb = function(response) {
			console.log(response);
			disableInterface();
			launchBurningProgressProcess();
		};

		var errorCb = function(response) {
			console.log(response);
		};

		burnFlashDrive(loaderList, mode, selectedFlashDrive.Letter, true, successCb, errorCb);
	});

	var burningProgressMessages;
	function launchBurningProgressProcess() {
		var successCb = function(response) {
			ISWORKING = true;
			var messages = response.NewMessages;
			if (!messages) {
				return;
			}
			console.log(response);
			for (var i = 0; i < messages.length; i++) {
				var msg = messages[i];
				var progressValue = msg.MsgTextFst; // Progress=Integer
				var loaderId = msg.MsgTextFrth; // Name=LoaderId
				var status = msg.MsgTextScnd; // Status=Running
				var type = msg.MsgType; // "JobSync"

				if (type == "JobSync" && status == "Initializing") {
					$('.loader-action-remcancel[data-loader-id="' + loaderId + '"]').removeClass("disabled");
				}

				if (type == "BurnFinished") {
					ISWORKING = false;
					enableInterface();
					clearInterval(burningProgressMessages);
					return;
				}

				if (type == "JobFinished") {
					$('.loader-action-remcancel[data-loader-id="' + loaderId + '"]').addClass("disabled");
				}

				if (progressValue == "Format") {
					$.growlUI('Info', 'Formatting flash Drive');
					continue;
				}

				var $loaderItem = $("#loader-list").find('.loader-item[data-loader-id="' + loaderId + '"]');
				var $progressBar = $loaderItem.find('.progress-bar[data-loader-id="' + loaderId + '"]');
				$progressBar.css("width", progressValue + "%").attr("aria-valuenow", progressValue);
				$progressBar.find("span").text(progressValue + "%");
				$loaderItem.find('.loader-status-value[data-loader-id="' + loaderId + '"]').text(" " + status);
			}
		};

		var errorCb = function(response) {
			console.log(response);
		};

		burningProgressMessages = setInterval(function(){
			getLoaderBurningProgress(true, successCb, errorCb);
		}, 1000);
	}

	function disableInterface() {
		$burnTypeSelect.addClass("disabled");
		$refreshDrivesBtn.addClass("disabled");
		$flashDriveSelectBtn.addClass("disabled");
		$burnBtn.addClass("disabled");
		$addLoaderBtn.addClass("disabled");
	}

	function enableInterface() {
		$burnTypeSelect.removeClass("disabled");
		$refreshDrivesBtn.removeClass("disabled");
		$flashDriveSelectBtn.removeClass("disabled");
		$burnBtn.removeClass("disabled");
		$addLoaderBtn.removeClass("disabled");
	}

	function collectLoaders() {
		var loaderList = [];
		var error = false;
		$("#loader-list").children().not("#addLoaderBtn").each(function() {
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
		}
		return loaderList;
	}

	$body.on("click", "button.loader-action-remcancel", function() {
		var loaderId = $(this).data("loader-id");
		$(this).addClass("disabled");
		if (ISWORKING) {
			var successCb = function(response) {
				console.log("CANCELLING RESPONSE");
				console.log(response);
			};
			var errorCb = function(response) {
				console.log("CANCELLING RESPONSE ERROR");
				console.log(response);
			};
			cancelLoader(true, successCb, errorCb);
		} else {
			var $loader = $("#loader-list").find('.loader-item[data-loader-id="' + loaderId + '"]');
			var $loaderIso = $('.loader-iso[data-loader-id="' + loaderId + '"]');
			var loaderIsoSizePerc = $loaderIso.data("loader-iso-size-percent");
			if (loaderIsoSizePerc) {
				var currentWidth = getCurrentWidthInPercent();
				currentWidth -= loaderIsoSizePerc;
				calcFlashDriveSize(currentWidth);
			}
			$loader.remove();
		}
	});

	function disableLoaderInterface(loaderId) {
		var loaders = $("#loader-list").find('.loader-item[data-loader-id="' + loaderId + '"]');
		loaders.find("input, button").not(".loader-action-minimize, .loader-action-linktoiso").addClass("disabled");
		loaders.find("select").prop('disabled', 'disabled');
	}

	$body.on("click", "#refreshFlashDrives", function() {
		selectedFlashDrive = -1;
		$flashDriveSelectUL.children().each(function() {
			$(this).remove();
		});
		$flashDriveSelectBtn.html("Choose flash drive <span class='caret'></span>");
		$burnTypeSelect.html("Type <span class='caret'></span>");
		disableInterface();
		renderFlashDrives();
	});

	function renderFlashDrives() {
		var successCb = function(response) {
			var select = $("#flashDriveSelectUl");
			var drives = response.Drives;
			if (!drives) {
				$.unblockUI();
				return;
			}
			for (var i = 0; i < drives.length; i++) {
				var drive = drives[i];
				var txt = drive.Name + " (" + drive.Letter.toUpperCase() + ":\\) " + drive.FS + " FreeSpace: " + Math.round(parseInt(drive.FreeSpace) / (1024*1024)) + "Mb. FullSize: " + Math.round(parseInt(drive.FullSize) / (1024*1024)) + "Mb";
				select.append("<li><a href='#' value='" + JSON.stringify(drive) + "'>" + txt + "</a></li>");
			}
			enableInterface();
			$addLoaderBtn.addClass("disabled");
			$burnTypeSelect.addClass("disabled");
			$burnBtn.addClass("disabled");
		};
		var errorCb = function(response) {
			console.log("ERROR BLAT");
			console.log(response);
		};
		getFlashDrives(true, successCb, errorCb);
	}

	$body.on('click', '#flashDriveSelectUl li a', function() {
		var fd = $(this).attr("value");
		selectedFlashDrive = $.parseJSON(fd);
		var txt = " (" + selectedFlashDrive.Letter.toUpperCase() + ":\\) " + selectedFlashDrive.FS;
		$flashDriveSelectBtn.html(txt + " <span class='caret'></span>");
		console.log("User select flash drive: " + fd);

		var value = getFlashDriveFilledSpace(selectedFlashDrive);
		value = isoSizeToPerc(value);
		calcFlashDriveSize(value);
		$burnTypeSelect.removeClass("disabled");
		$addLoaderBtn.removeClass("disabled");
	});

	$body.on('click', '#burnTypeSelectUL li a', function() {
		var chosenType = $(this).text();
		$burnTypeSelect.html(chosenType + " <span class='caret'></span>");

		var allLoaderSize = 0;
		$("#loader-list").children().not("#addLoaderBtn").each(function() {
			var loaderId = $(this).data("loader-id");
			var loaderISO = $('.loader-iso[data-loader-id="' + loaderId + '"]');
			allLoaderSize += loaderISO.data("loader-iso-size");
		});

		var value = allLoaderSize;
		var filledSpace = getFlashDriveFilledSpace(selectedFlashDrive);
		if (chosenType == MODE_ADD) {
			value += filledSpace;
		}
		value = isoSizeToPerc(value);
		calcFlashDriveSize(value);
		$burnBtn.removeClass("disabled");
	});

	$body.on('click', '.loader-action-chooseiso', function() {
		var loaderId = $(this).data('loader-id');
		var loaderSelect = $('select[data-loader-id="' + loaderId + '"]');
		var loaderSelectSelected = loaderSelect.find(':selected');
		var loaderCode = loaderSelectSelected.data('code');
		console.log(loaderCode);
		var successCb = function(response) {
			console.log(response);
			if (response.Error) {
				// TODO think about it because some error means that user just close FileBrowser and we have to handle it
				alert("Internal server error. Please contact to a support. Error: " + response.Error);
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
			var sizePerc = isoSizeToPerc(size);
			console.log("Selected ISO: " + path + " with size: " + size + " for loader: " + loaderId);
			currentWidth += sizePerc;
			var isSet = calcFlashDriveSize(currentWidth, true);

			if (isSet) {
				var label = $('<label>', {class: "loader-iso", "data-loader-id": loaderId, "data-loader-iso-path": path, "data-loader-iso-size-percent": sizePerc, "data-loader-iso-size": size, text: path + " " + size + "Mb"});
				console.log("Created label for chosen ISO");
				console.log(label);

				$('.loader-information[data-loader-id="' + loaderId + '"]').append(label)
			}
		};

		var errorCb = function(response) {
			console.log("ERROR BLAT");
			console.log(response);
		};
		openBrowseDialog(false, "Window title", loaderCode, successCb, errorCb)
	});

	function getFlashDriveFilledSpace() {
		var flashDriveFullSize = parseInt(selectedFlashDrive.FullSize);
		var flashDriveFreeSpace = parseInt(selectedFlashDrive.FreeSpace);
		return flashDriveFullSize - flashDriveFreeSpace;
	}

	function isoSizeToPerc(size) {
		var flashDriveFullSize = parseInt(selectedFlashDrive.FullSize);
		return Math.round((parseInt(size) * 100) / flashDriveFullSize);
	}

	function calcFlashDriveSize(widthInPerc) {
		var $progressBar = $("#flashDriveSizeBarGreen");

		if (widthInPerc > 80 && widthInPerc < 98) {
			$.growlUI('Error', 'Your flash drive has more than 80% capacity filled. Be carefully.');
		} else if (widthInPerc > 98) {
			$.growlUI('Error', 'Your flash drive has more than 98% capacity filled. We can\'t burn this loader.');
			return false;
		}
		$progressBar.width(widthInPerc+"%");
		return true;
	}

	function getCurrentWidthInPercent() {
		var $progressBar = $("#flashDriveSizeBarGreen");
		var width = $progressBar.width();
		var parentWidth = $progressBar.offsetParent().width();
		var percent = 100 * width/parentWidth;
		return parseInt(percent);
	}

	$addLoaderBtn.click(function() {
		if ($(this).hasClass("disabled")) {
			return false;
		}
		var id = generateUUID();
		var loaderItem = buildLoaderItem(id);
		$("#loader-list").prepend(loaderItem);
		loaderItem.slideDown(500);
	});

	$body.on("click", ".loader-action-minimize", function() {
		var id = $(this).data("loader-id");
		// hide status
		$('.loader-status[data-loader-id="' + id + '"]');
		// move progressbar
		var $loaderProgressBar = $('.loader-progressbar[data-loader-id="' + id + '"]');
		var $loaderItem = $('.loader-item[data-loader-id="' + id + '"]');
		$loaderProgressBar.prependTo($loaderItem);
		// and make it small
		$loaderProgressBar.find(".progress").addClass("progress-minimized");
		// change button to maximize
		$(this).addClass("loader-action-maximize").removeClass('loader-action-minimize');
		$(this).find("span.glyphicon-minus").removeClass("glyphicon-minus").addClass("glyphicon-plus");
	});

	$body.on("click", ".loader-action-maximize", function() {
		var id = $(this).data("loader-id");
		// show status
		var status = $('.loader-status[data-loader-id="' + id + '"]');
		status.remove();
		// move progressbar
		var $loaderProgressBar = $('.loader-progressbar[data-loader-id="' + id + '"]');
		var $loaderItem = $('.loader-item[data-loader-id="' + id + '"]');
		$loaderProgressBar.appendTo($loaderItem);
		// append status
		status.appendTo($loaderItem);
		// and make it small
		$loaderProgressBar.find(".progress").removeClass("progress-minimized");
		// change button to maximize
		$(this).removeClass("loader-action-maximize").addClass('loader-action-minimize');
		$(this).find("span.glyphicon-plus").addClass("glyphicon-minus").removeClass("glyphicon-plus");
	});

	$body.on("click", "button, input", function(){
		var border = $(this).css('border-color');
		if (border == "rgb(255, 0, 0)") {
			$(this).css({'border-color': ''});
		}
	});

	// IT IS DLL.JS
	function getFlashDrives(async, successCb, errorCb) {
		$.ajax({
			url: "/",
			type: "POST",
			dataType: "JSON",
			data: { "Operation": "GetFlashDrives"},
			async: async,
			success: function (response) {
				successCb(response);
			},
			error: function (response) {
				errorCb(response);
			}
		});
	}

	function cancelLoader(async, successCb, errorCb) {
		dontBlock = true;
		$.ajax({
			url: "/",
			type: "POST",
			dataType: "JSON",
			data: { "Operation": "CancelCurrent" },
			async: async,
			success: function (response) {
				successCb(response);
			},
			error: function (response) {
				errorCb(response);
			}
		})
	}

	function disableLoader(jobName, async, successCb, errorCb) {
		dontBlock = true;
		$.ajax({
			url: "/",
			type: "POST",
			dataType: "JSON",
			data: { "Operation": "Disable", "JobName":jobName },
			async: async,
			success: function (response) {
				successCb(response);
			},
			error: function (response) {
				errorCb(response);
			}
		})
	}

	function enableLoader(async, successCb, errorCb) {
		dontBlock = true;
		$.ajax({
			url: "/",
			type: "POST",
			dataType: "JSON",
			data: { "Operation": "Enable", "JobName":jobName },
			async: async,
			success: function (response) {
				successCb(response);
			},
			error: function (response) {
				errorCb(response);
			}
		})
	}

	function burnFlashDrive(loadersJson, mode, flashDriveLetter, async, successCb, errorCb) {
		dontBlock = true;
		$.ajax({
			url: "/",
			type: "POST",
			encoding: "UTF8",
			dataType: "JSON",
			data: {
				"Operation": "BurnFlashDrive",
				"FlashDrive": flashDriveLetter,
				"Mode": mode,
				"NewFS" : "NTFS",
				"Loaders": loadersJson
			},
			async: async,
			success: function (response) {
				successCb(response);
			},
			error: function (response) {
				errorCb(response);
			}
		});
	}

	function getLoaderBurningProgress(async, successCb, errorCb) {
		dontBlock = true;
		$.ajax({
			url: "/",
			type: "POST",
			dataType: "JSON",
			global: false,
			data: { "Operation": "CheckMessages" },
			async: async,
			success: function (response) {
				successCb(response);
			},
			error: function (response) {
				errorCb(response);
			}
		})
	}

	function openBrowseDialog(async, windowTitle, loaderCode, successCb, errorCb, rsa) {
		$.ajax({
			url: "/",
			type: "POST",
			dataType: "JSON",
			data: { "Operation":"FlOpnDlg", "Name": windowTitle, "Id": loaderCode, "RSA": rsa },
			async: async,
			success: function (response) {
				successCb(response);
			},
			error: function (response) {
				errorCb(response);
			}
		})
	}

	function getSessionId() {
		$.ajax({
			url: "/",
			type: "POST",
			dataType: "JSON",
			data: { "Operation": "GetSessionId" },
			async: false,
			success: function (response) {
				console.log("GetSessionId");
				console.log(JSON.stringify(response));
				SESSIONID = response.SessionUID;
				getLoadersJson();
			},
			error: function (response) {
				console.log(response);
			}
		});
	}

	function getLoadersJson() {
		$.ajax({
			url: "/",
			type: "POST",
			dataType: "JSON",
			data: { "Operation": "GetExistLoaders" },
			async: false,
			success: function (response) {
				console.log("GetExistLoaders");
				console.log(JSON.stringify(response));
				var loadersJson = response.ExistLoaders;
				if (loadersJson == "null") {
					init();
					return;
				}
				loadersJson = loadersJson.split(",");
				console.log(loadersJson);
				renderLoadersJson(loadersJson);
				init();
			},
			error: function (response) {
				console.log(response);
			}
		});
	}

	function renderLoadersJson(loadersJson) {
		for (var loader in loadersJson) {
			var loaderId = generateUUID();
			var loaderCode = loader;
			console.log(loaderId);
			console.log(loaderCode);
			var $loaderItem = buildLoaderItem(loaderId);
			$("#loader-list").prepend($loaderItem);
			$loaderItem.slideDown(500);
			var loaderSelect = $('select[data-loader-id="' + loaderId + '"]');
			var loaderSelectOption = loaderSelect.find('option[data-code="' + loaderCode + '"]');
			loaderSelectOption.prop('selected', true);
		}
	}

	function log(message, async, successCb, errorCb) {
		dontBlock = true;

		$.ajax({
			url: "/",
			type: "POST",
			dataType: "JSON",
			data: { "Operation": "WriteLogMessage", "Message": message},
			async: async,
			success: function (response) {
				successCb(response);
			},
			error: function (response) {
				errorCb(response);
			}
		});
	}

	function genHash(data) {
		data = data.split("").reverse().join("").substring(0, data.length - 1);
		// TODO get key
		var key = "KeyY";
		var shaObj = new jsSHA(data, "TEXT");
		var hash = shaObj.getHash("SHA-1", "HEX");
		return shaObj.getHMAC(key, "TEXT", "SHA-1", "HEX");
	}

	function generateUUID(){
		var d = new Date().getTime();
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		});
	}

	//function buildLoaderItem(loaderId) {
	//	var template =
	//		_.template('<div data-loader-id="<%= loaderId %>" class="maximized" style="display: block;">' +
	//			'<div class="row" style="margin: 0px; padding-top: 4px; padding-bottom: 4px;">' +
	//				'<div class="col-xs-9">' +
	//					'<div data-loader-id="<%= loaderId %>" class="loader-information input-group btn-group-sm" role="group">' +
	//						'<button data-loader-id="<%= loaderId %>" type="button" class="loader-action-chooseiso btn btn-default">' +
	//							'<span class="glyphicon glyphicon-search" aria-hidden="true"></span>' +
	//						'</button>' +
	//						'<button data-loader-id="<%= loaderId %>" type="button" class="loader-action-linktoiso btn btn-default">' +
	//							'<span class="glyphicon glyphicon-new-window" aria-hidden="true"></span>' +
	//						'</button>' +
	//						'<select data-loader-id="<%= loaderId %>" class="loader-type-select form-control input-sm" style="width: auto; height: 30px; display: inline;">' +
	//							'<option value="windows7" data-code="0" data-url="http://yandex.com/">Windows 7</option>' +
	//							'<option value="windows8" data-code="1" data-url="http://yandex.com/">Windows 8</option>' +
	//							'<option value="windows10" data-code="2" data-url="http://yandex.com/">Windows 10</option>' +
	//							'<option value="kav" data-code="3" data-url="http://yandex.com/">Kasperksy Rescue Disk</option>' +
	//							'<option value="avg" data-code="4" data-url="http://yandex.com/">AVG Rescue Disk</option>' +
	//							'<option value="ubuntu" data-code="5" data-url="http://yandex.com/">Ubuntu Linux</option>' +
	//							'<option value="hiren" data-code="6" data-url="http://yandex.com/">Hiren\'s Boot CD</option>' +
	//							'<option value="parted" data-code="7" data-url="http://yandex.com/">Parted Magic</option>' +
	//							'<option value="drweb" data-code="8" data-url="http://yandex.com/">Dr. Web Live Disk</option>' +
	//							'<option value="clonezilla" data-code="9" data-url="http://yandex.com/">CloneZilla Live</option>' +
	//						'</select>' +
	//					'</div>' +
	//				'</div>' +
	//				'<div class="col-xs-3">' +
	//					'<div data-loader-id="<%= loaderId %>" class="loader-actions btn-group btn-group-sm" style="float: right;" role="group" aria-label="...">' +
	//						'<button data-loader-id="<%= loaderId %>" type="button" class="loader-action-endisable btn btn-warning" aria-label="Left Align" style="display:none;">' +
	//							'<span class="glyphicon glyphicon-pause" aria-hidden="true"></span>' +
	//						'</button>' +
	//						'<button data-loader-id="<%= loaderId %>" type="button" class="loader-action-remcancel btn btn-danger" aria-label="Left Align">' +
	//							'<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>' +
	//						'</button>' +
	//						'<button data-loader-id="<%= loaderId %>" type="button" class="loader-action-minimize btn btn-default" aria-label="Left Align">' +
	//							'<span class="glyphicon glyphicon-minus" aria-hidden="true"></span>' +
	//						'</button>' +
	//					'</div>' +
	//				'</div>' +
	//			'</div>' +
	//			'<div data-loader-id="<%= loaderId %>" class="row loader-progressbar" style="margin: 0;">' +
	//				'<div class="col-xs-12">' +
	//					'<div data-loader-id="<%= loaderId %>" class="progress" style="margin-bottom: 0px;">' +
	//						'<div data-loader-id="<%= loaderId %>" class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;">' +
	//							'<span data-loader-id="<%= loaderId %>">0%</span>' +
	//						'</div>' +
	//					'</div>' +
	//				'</div>' +
	//			'</div>' +
	//			'<div data-loader-id="<%= loaderId %>" class="row loader-status" style="margin: 0px;">' +
	//				'<div class="loader-status col-xs-12">' +
	//					'<label>Status:</label>' +
	//					'<small data-loader-id="<%= loaderId %>" class="loader-status-value">Waiting...</small>' +
	//				'</div>' +
	//			'</div>' +
	//		'</div>');
	//
	//	return template({loaderId:loaderId});
	//}

	function buildLoaderItem(loaderId) {
		var $loaderItem = $("<div>", {"data-loader-id": loaderId, class: "loader-item list-group-item", style: "padding: 0px; display: none;"});
		var $loaderItemMaximized = $("<div>", {"data-loader-id": loaderId, class: "maximized", style: "display: block;"});
		// loader name and buttons
		var $loaderItemMaximizedRow = $("<div>", {class:"row", style:"margin: 0px; padding-top: 4px; padding-bottom: 4px;"});
		var $loaderItemMaximizedRowColXs9 = $("<div>", {class:"col-xs-9"});
		var $loaderItemMaximizedRowColXs9InputGrp = $("<div>", {"data-loader-id":loaderId, class:"loader-information input-group btn-group-sm", role:"group"});
		var $loaderItemMaximizedRowColXs9InputGrpSelectLoaderType = $("<select>", {"data-loader-id":loaderId, class:"loader-type-select form-control input-sm", style:"width: auto; height: 30px; display: inline;"});
		var $loaderItemMaximizedRowColXs9InputGrpSelectLoaderTypeOption0 = $('<option>', {value:"windows7",  "data-code":"0", "data-url":"http://yandex.com/", text:"Windows 7"});
		var $loaderItemMaximizedRowColXs9InputGrpSelectLoaderTypeOption1 = $('<option>', {value:"windows8",  "data-code":"1", "data-url":"http://yandex.com/", text:"Windows 8"});
		var $loaderItemMaximizedRowColXs9InputGrpSelectLoaderTypeOption2 = $('<option>', {value:"windows10", "data-code":"2", "data-url":"http://yandex.com/", text:"Windows 10"});
		var $loaderItemMaximizedRowColXs9InputGrpSelectLoaderTypeOption3 = $('<option>', {value:"kav", 		 "data-code":"3", "data-url":"http://yandex.com/", text:"Kasperksy Rescue Disk"});
		var $loaderItemMaximizedRowColXs9InputGrpSelectLoaderTypeOption4 = $('<option>', {value:"avg", 		 "data-code":"4", "data-url":"http://yandex.com/", text:"AVG Rescue Disk"});
		var $loaderItemMaximizedRowColXs9InputGrpSelectLoaderTypeOption5 = $('<option>', {value:"ubuntu", 	 "data-code":"5", "data-url":"http://yandex.com/", text:"Ubuntu Linux"});
		var $loaderItemMaximizedRowColXs9InputGrpSelectLoaderTypeOption6 = $('<option>', {value:"hiren", 	 "data-code":"6", "data-url":"http://yandex.com/", text:"Hiren\'s Boot CD"});
		var $loaderItemMaximizedRowColXs9InputGrpSelectLoaderTypeOption7 = $('<option>', {value:"parted", 	 "data-code":"7", "data-url":"http://yandex.com/", text:"Parted Magic"});
		var $loaderItemMaximizedRowColXs9InputGrpSelectLoaderTypeOption8 = $('<option>', {value:"drweb", 	 "data-code":"8", "data-url":"http://yandex.com/", text:"Dr. Web Live Disk"});
		var $loaderItemMaximizedRowColXs9InputGrpSelectLoaderTypeOption9 = $('<option>', {value:"clonezilla","data-code":"9", "data-url":"http://yandex.com/", text:"CloneZilla Live"});
		var $loaderItemMaximizedRowColXs9InputGrpChooseISOBtn = $("<button>", {"data-loader-id":loaderId, type:"button", class:"loader-action-chooseiso btn btn-default"});
		var $loaderItemMaximizedRowColXs9InputGrpChooseISOBtnGlyph = $("<span>", {class:"glyphicon glyphicon-search", "aria-hidden":"true"});
		var $loaderItemMaximizedRowColXs9InputGrpLinkBtn = $("<button>", {"data-loader-id":loaderId, type:"button", class:"loader-action-linktoiso btn btn-default"});
		var $loaderItemMaximizedRowColXs9InputGrpLinkBtnGlyph = $("<span>", {class:"glyphicon glyphicon-new-window", "aria-hidden":"true"});

		var $loaderItemMaximizedRowColXs3 = $("<div>", {class:"col-xs-3"});
		var $loaderItemMaximizedRowColXs3Buttons = $("<div>", {"data-loader-id":loaderId, class:"loader-actions btn-group btn-group-sm", style:"float: right;", role:"group", "aria-label":"..."});
		var $loaderItemMaximizedRowColXs3EndisableBtn = $("<button>", {"data-loader-id":loaderId, type:"button", class:"loader-action-endisable btn btn-warning", "aria-label":"Left Align", "style":"display:none;"});
		var $loaderItemMaximizedRowColXs3EndisableBtnGlyphIcon = $("<span>", {class:"glyphicon glyphicon-pause", "aria-hidden":"true"});
		var $loaderItemMaximizedRowColXs3RemCancelBtn = $("<button>", {"data-loader-id":loaderId, type:"button", class:"loader-action-remcancel btn btn-danger", "aria-label":"Left Align"});
		var $loaderItemMaximizedRowColXs3RemCancelBtnGlyphIcon = $("<span>", {class:"glyphicon glyphicon-remove", "aria-hidden":"true"});
		var $loaderItemMaximizedRowColXs3MinimizeBtn = $("<button>", {"data-loader-id":loaderId, type:"button", class:"loader-action-minimize btn btn-default", "aria-label":"Left Align"});
		var $loaderItemMaximizedRowColXs3MinimizeBtnGlyphIcon = $("<span>", {class:"glyphicon glyphicon-minus", "aria-hidden":"true"});
		// loader progress bar
		var $loaderItemMinimizedRowProgress = $("<div>", {"data-loader-id": loaderId, class:"row loader-progressbar", style:"margin: 0px;"});
		var $loaderItemMinimizedRowProgressColXs12 = $("<div>", {class:"col-xs-12"});
		var $loaderItemMinimizedRowProgressColXs12ProgressDiv = $("<div>", {"data-loader-id":loaderId, class:"progress", style:"margin-bottom: 0px;"});
		var $loaderItemMinimizedRowProgressColXs12ProgressDivProgressBar = $("<div>", {"data-loader-id":loaderId, class:"progress-bar progress-bar-striped active", role:"progressbar", "aria-valuenow":"0", "aria-valuemin":"0", "aria-valuemax":"100", style:"width: 0%;"});
		var $loaderItemMinimizedRowProgressColXs12ProgressDivProgressBarValueSpan = $("<span>", {"data-loader-id": loaderId, text:"0%"});
		// loader status
		var $loaderItemMaximizedRowStatus = $("<div>", {"data-loader-id": loaderId, class:"row loader-status", style:"margin: 0px;"});
		var $loaderItemMaximizedRowStatusColXs12 = $("<div>", {class:"loader-status col-xs-12"});
		var $loaderItemMaximizedRowStatusColXs12Label = $("<label>", {text:"Status:"});
		var $loaderItemMaximizedRowStatusColXs12Small = $("<small>", {"data-loader-id":loaderId,class:"loader-status-value", text:" Waiting..."});


		$loaderItemMaximizedRowColXs9InputGrpChooseISOBtn.append($loaderItemMaximizedRowColXs9InputGrpChooseISOBtnGlyph);
		$loaderItemMaximizedRowColXs9InputGrp.append($loaderItemMaximizedRowColXs9InputGrpChooseISOBtn);
		$loaderItemMaximizedRowColXs9InputGrpLinkBtn.append($loaderItemMaximizedRowColXs9InputGrpLinkBtnGlyph);
		$loaderItemMaximizedRowColXs9InputGrp.append($loaderItemMaximizedRowColXs9InputGrpLinkBtn);
		// options for select loader type
		$loaderItemMaximizedRowColXs9InputGrpSelectLoaderType.append($loaderItemMaximizedRowColXs9InputGrpSelectLoaderTypeOption0);
		$loaderItemMaximizedRowColXs9InputGrpSelectLoaderType.append($loaderItemMaximizedRowColXs9InputGrpSelectLoaderTypeOption1);
		$loaderItemMaximizedRowColXs9InputGrpSelectLoaderType.append($loaderItemMaximizedRowColXs9InputGrpSelectLoaderTypeOption2);
		$loaderItemMaximizedRowColXs9InputGrpSelectLoaderType.append($loaderItemMaximizedRowColXs9InputGrpSelectLoaderTypeOption3);
		$loaderItemMaximizedRowColXs9InputGrpSelectLoaderType.append($loaderItemMaximizedRowColXs9InputGrpSelectLoaderTypeOption4);
		$loaderItemMaximizedRowColXs9InputGrpSelectLoaderType.append($loaderItemMaximizedRowColXs9InputGrpSelectLoaderTypeOption5);
		$loaderItemMaximizedRowColXs9InputGrpSelectLoaderType.append($loaderItemMaximizedRowColXs9InputGrpSelectLoaderTypeOption6);
		$loaderItemMaximizedRowColXs9InputGrpSelectLoaderType.append($loaderItemMaximizedRowColXs9InputGrpSelectLoaderTypeOption7);
		$loaderItemMaximizedRowColXs9InputGrpSelectLoaderType.append($loaderItemMaximizedRowColXs9InputGrpSelectLoaderTypeOption8);
		$loaderItemMaximizedRowColXs9InputGrpSelectLoaderType.append($loaderItemMaximizedRowColXs9InputGrpSelectLoaderTypeOption9);
		$loaderItemMaximizedRowColXs9InputGrp.append($loaderItemMaximizedRowColXs9InputGrpSelectLoaderType);
		$loaderItemMaximizedRowColXs9.append($loaderItemMaximizedRowColXs9InputGrp);
		$loaderItemMaximizedRow.append($loaderItemMaximizedRowColXs9);

		$loaderItemMaximizedRowColXs3EndisableBtn.append($loaderItemMaximizedRowColXs3EndisableBtnGlyphIcon);
		$loaderItemMaximizedRowColXs3Buttons.append($loaderItemMaximizedRowColXs3EndisableBtn);
		$loaderItemMaximizedRowColXs3RemCancelBtn.append($loaderItemMaximizedRowColXs3RemCancelBtnGlyphIcon);
		$loaderItemMaximizedRowColXs3Buttons.append($loaderItemMaximizedRowColXs3RemCancelBtn);
		$loaderItemMaximizedRowColXs3MinimizeBtn.append($loaderItemMaximizedRowColXs3MinimizeBtnGlyphIcon);
		$loaderItemMaximizedRowColXs3Buttons.append($loaderItemMaximizedRowColXs3MinimizeBtn);
		$loaderItemMaximizedRowColXs3.append($loaderItemMaximizedRowColXs3Buttons);
		$loaderItemMaximizedRow.append($loaderItemMaximizedRowColXs3);
		$loaderItemMaximized.append($loaderItemMaximizedRow);

		$loaderItemMinimizedRowProgressColXs12ProgressDivProgressBar.append($loaderItemMinimizedRowProgressColXs12ProgressDivProgressBarValueSpan);
		$loaderItemMinimizedRowProgressColXs12ProgressDiv.append($loaderItemMinimizedRowProgressColXs12ProgressDivProgressBar);
		$loaderItemMinimizedRowProgressColXs12.append($loaderItemMinimizedRowProgressColXs12ProgressDiv);
		$loaderItemMinimizedRowProgress.append($loaderItemMinimizedRowProgressColXs12);
		$loaderItemMaximized.append($loaderItemMinimizedRowProgress);

		$loaderItemMaximizedRowStatusColXs12.append($loaderItemMaximizedRowStatusColXs12Label);
		$loaderItemMaximizedRowStatusColXs12.append($loaderItemMaximizedRowStatusColXs12Small);
		$loaderItemMaximizedRowStatus.append($loaderItemMaximizedRowStatusColXs12);
		$loaderItemMaximized.append($loaderItemMaximizedRowStatus);

		$loaderItem.append($loaderItemMaximized);

		return $loaderItem;
	}

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
				if (response.success) {
					$.growlUI('Success', 'Thank you!');
				}
			},
			error: function (response) {
			}
		});
	});

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

});
$(document).ready(function() {

	'use strict';

	$.blockUI.defaults.fadeIn = 0;
	$.blockUI.defaults.fadeOut = 0;
	$.blockUI.defaults.message = '<h3><img height=50 src="http://77.221.146.148:1337/assets/small_ui/img/loading.gif" /> Please wait...</h3>';

	var dontBlock = false;

	$(document).ajaxStart(function(){
		if(!dontBlock)
			$.blockUI();
	}).ajaxStop($.unblockUI);
	
	var $burnTypeSelect = $("#burnTypeSelectBtn");
	var $burnTypeSelectUL = $("#burnTypeSelectUL");
	var $flashDriveSelectBtn = $("#flashDriveSelectBtn");
	var $flashDriveSelectUL = $("#flashDriveSelectUl");
	var $body = $("body");
	var $burnBtn = $("#burnBtn");
	var $refreshDrivesBtn = $("#refreshFlashDrives");

	var MODE_NONE = "Type";
	var MODE_CURRENT = MODE_NONE;
	var MODE_NEW = "New";
	var MODE_ADD = "Add";
	var ISWORKING = false;

	renderFlashDrives();

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

		for (var i=0; i<loaderList.length; i++) {
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
			console.log(response);
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
	}

	function enableInterface() {
		$burnTypeSelect.removeClass("disabled");
		$refreshDrivesBtn.removeClass("disabled");
		$flashDriveSelectBtn.removeClass("disabled");
		$burnBtn.removeClass("disabled");
	}

	function collectLoaders() {
		var loaderList = [];
		var error = false;
		$("#loader-list").children().not("#add-loader").each(function() {
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
			var loaderCode = loaderSelectSelected.data('code');
			if (!loaderCode) {
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
			$("#loader-list").find('.loader-item[data-loader-id="' + loaderId + '"]').remove();
		}
	});

	function disableLoaderInterface(loaderId) {
		var loaders = $("#loader-list").find('.loader-item[data-loader-id="' + loaderId + '"]');
		loaders.find("input, button").not(".loader-action-minimize, .loader-action-linktoiso").addClass("disabled");
		loaders.find("select").prop('disabled', 'disabled');
	}

	$body.on("click", "#refreshFlashDrives", function() {
		$flashDriveSelectUL.children().each(function() {
			$(this).remove();
		});
		$flashDriveSelectBtn.html("Choose flash drive <span class='caret'></span>");
		$burnTypeSelect.html("Type <span class='caret'></span>");
		$burnTypeSelect.addClass("disabled");
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
			$flashDriveSelectBtn.removeClass("disabled");
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
		$("#add-loader").removeClass("disabled")
		$burnTypeSelect.removeClass("disabled");
	});

	$body.on('click', '#burnTypeSelectUL li a', function() {
		var chosenType = $(this).text();
		$burnTypeSelect.html(chosenType + " <span class='caret'></span>");
		if (chosenType == MODE_ADD) {
			// TODO
		} else if (chosenType == MODE_NEW) {
			// TODO
		}
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

			var prevIso = $('.loader-iso[data-loader-id="' + loaderId + '"]');
			var prevIsoSizePercent = prevIso.data("loader-iso-size-percent");
			if (prevIsoSizePercent) {
				prevIso.remove();
			}
			var path = response.Path;
			var size = Math.round(parseInt(response.Size) / (1024*1024));
			console.log("Selected ISO: " + path + " with size: " + size + " for loader: " + loaderId);
			var newWidthFlashDriveCapacity = calcFlashDriveSize(size, prevIsoSizePercent);
			if (newWidthFlashDriveCapacity > 80) {
				alert("Your flash drive has more than 80% capacity filled. Be carefull.");
			} else if (newWidthFlashDriveCapacity > 98) {
				alert("Your flash drive has more than 98% capacity filled. We can't burn this loader.");
				return false;
			}
			$("#flashDriveSizeBarGreen").width(newWidthFlashDriveCapacity);
			var label = $('<label>', {class: "loader-iso", "data-loader-id": loaderId, "data-loader-iso-path": path, "data-loader-iso-size-percent": newWidthFlashDriveCapacity, "data-loader-iso-size": size, text: "- " + path + " " + size + "Mb", style: "padding-left: 10px;" });
			console.log("Created label for chosen ISO");
			console.log(label);

			$('.loader-information[data-loader-id="' + loaderId + '"]').append(label)
		};

		var errorCb = function(response) {
			console.log("ERROR BLAT");
			console.log(response);
		};
		openBrowseDialog(false, "Window title", loaderCode, successCb, errorCb)
	});

	function calcFlashDriveSize(newIsoSize, prevIsoSizePercent) {
		var green = parseInt($("#flashDriveSizeBarGreen").width());
		var flashDriveFullSize = Math.round(parseInt(selectedFlashDrive.FullSize) / (1024*1024));
		var value = Math.round((parseInt(newIsoSize) * 100) / flashDriveFullSize);
		var newWidth = green+value;
		if (prevIsoSizePercent) {
			newWidth = newWidth - prevIsoSizePercent;
		}
		console.log(newWidth);
		return newWidth;
	}

	$("#add-loader").click(function() {
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
		// hide task
		$('.loader-task[data-loader-id="' + id + '"]');
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
		// show task
		var task = $('.loader-task[data-loader-id="' + id + '"]');
		task.remove();
		// show status
		var status = $('.loader-status[data-loader-id="' + id + '"]');
		status.remove();
		// move progressbar
		var $loaderProgressBar = $('.loader-progressbar[data-loader-id="' + id + '"]');
		var $loaderItem = $('.loader-item[data-loader-id="' + id + '"]');
		$loaderProgressBar.appendTo($loaderItem);
		// append task and status
		status.appendTo($loaderItem);
		task.appendTo($loaderItem);
		// and make it small
		$loaderProgressBar.find(".progress").removeClass("progress-minimized");
		// change button to maximize
		$(this).removeClass("loader-action-maximize").addClass('loader-action-minimize');
		$(this).find("span.glyphicon-plus").addClass("glyphicon-minus").removeClass("glyphicon-plus");
	});
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

function log(message, async, successCb, errorCb) {
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

function buildLoaderItem(loaderId) {
	var $loaderItem = $("<div>", {"data-loader-id": loaderId, class: "loader-item list-group-item", style: "padding: 0px; display: none;"});
	var $loaderItemMaximized = $("<div>", {"data-loader-id": loaderId, class: "maximized", style: "display: block;"});
	// loader name and buttons
	var $loaderItemMaximizedRow = $("<div>", {class:"row", style:"margin: 0px; padding-top: 4px; padding-bottom: 4px;"});
	var $loaderItemMaximizedRowColXs9 = $("<div>", {class:"col-xs-9"});
	var $loaderItemMaximizedRowColXs9InputGrp = $("<div>", {"data-loader-id":loaderId, class:"loader-information input-group btn-group-sm", role:"group"});
	var $loaderItemMaximizedRowColXs9InputGrpSelectLoaderType = $("<select>", {"data-loader-id":loaderId, class:"loader-type-select form-control input-sm", style:"width: auto; height: 30px; display: inline;"});
	var $loaderItemMaximizedRowColXs9InputGrpSelectLoaderTypeOption1 = $("<option>", {value:"windows7", "data-code":"3", "data-url":"http://yandex.com/", text:"Windows 7, 8, 10, 2008 Server and etc."});
	var $loaderItemMaximizedRowColXs9InputGrpSelectLoaderTypeOption2 = $("<option>", {value:"windowsxp", "data-code":"4", "data-url":"http://yandex.com/", text:"Windows XP, 2003 Server and etc."});
	var $loaderItemMaximizedRowColXs9InputGrpSelectLoaderTypeOption3 = $("<option>", {value:"kav", "data-code":"5", "data-url":"http://yandex.com/", text:"Kasperksy Rescue Disk"});
	var $loaderItemMaximizedRowColXs9InputGrpChooseISOBtn = $("<button>", {"data-loader-id":loaderId, type:"button", class:"loader-action-chooseiso btn btn-default"});
	var $loaderItemMaximizedRowColXs9InputGrpChooseISOBtnGlyph = $("<span>", {class:"glyphicon glyphicon-search", "aria-hidden":"true"});
	var $loaderItemMaximizedRowColXs9InputGrpLinkBtn = $("<button>", {"data-loader-id":loaderId, type:"button", class:"loader-action-linktoiso btn btn-default"});
	var $loaderItemMaximizedRowColXs9InputGrpLinkBtnGlyph = $("<span>", {class:"glyphicon glyphicon-new-window", "aria-hidden":"true"});

	var $loaderItemMaximizedRowColXs3 = $("<div>", {class:"col-xs-3"});
	var $loaderItemMaximizedRowColXs3Buttons = $("<div>", {"data-loader-id":loaderId, class:"loader-actions btn-group btn-group-sm", style:"float: right;", role:"group", "aria-label":"..."});
	var $loaderItemMaximizedRowColXs3EndisableBtn = $("<button>", {"data-loader-id":loaderId, type:"button", class:"loader-action-endisable btn btn-warning", "aria-label":"Left Align", "style":"display:none;"});
	var $loaderItemMaximizedRowColXs3EndisableBtnGlyphIcon = $("<span>", {class:"glyphicon glyphicon-pause", "aria-hidden":"true"});
	var $loaderItemMaximizedRowColXs3RemCancelBtn = $("<button>", {"data-loader-id":loaderId, type:"button", class:"loader-action-remcancel btn btn-danger", "aria-label":"Left Align"});
	var $loaderItemMaximizedRowColXs3RemCancelBtnGlyphIcon = $("<span>", {class:"glyphicon glyphicon-pause", "aria-hidden":"true"});
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
	$loaderItemMaximizedRowColXs9InputGrpSelectLoaderType.append($loaderItemMaximizedRowColXs9InputGrpSelectLoaderTypeOption1);
	$loaderItemMaximizedRowColXs9InputGrpSelectLoaderType.append($loaderItemMaximizedRowColXs9InputGrpSelectLoaderTypeOption2);
	$loaderItemMaximizedRowColXs9InputGrpSelectLoaderType.append($loaderItemMaximizedRowColXs9InputGrpSelectLoaderTypeOption3);
	$loaderItemMaximizedRowColXs9InputGrp.append($loaderItemMaximizedRowColXs9InputGrpSelectLoaderType)
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
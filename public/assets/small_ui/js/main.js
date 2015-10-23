$(document).ready(function() {
	$.blockUI.defaults.fadeIn = 0;
	$.blockUI.defaults.fadeOut = 0;
	$.blockUI.defaults.message = '<h3><img height=50 src="http://109.120.173.163:1337/small_ui/img/loading.gif" /> Please wait...</h3>';
	$(document).ajaxStart($.blockUI).ajaxStop($.unblockUI);

	renderFlashDrives();
	$("#flashDriveSelect").html("<option value='-1'>Choose flash drive");

	var selectedFlashDrive = -1;

	$("#burnBtn").click(function() {
		collectLoaders();
	});

	function collectLoaders() {
		$("#loader-list").children().not("#add-loader").each(function() {
			alert($(this).data("loader-id"));
		});
	}

	$("body").on("click", "#refreshFlashDrives", function() {
		renderFlashDrives();
	});

	function renderFlashDrives() {
		successCb = function(response) {
			var select = $("#flashDriveSelect").html("<option value='-1'>Choose flash drive");
			var drives = response.Drives;
			if (!drives) {
				$.unblockUI();
				return;
			}
			for (var i = 0; i < drives.length; i++) {
				var drive = drives[i];
				var txt = drive.Name + " (" + drive.Letter.toUpperCase() + ":\\) " + drive.FS + " FreeSpace: " + Math.round(parseInt(drive.FreeSpace) / (1024*1024)) + "Mb. FullSize: " + Math.round(parseInt(drive.FullSize) / (1024*1024)) + "Mb";
				select.append("<option value='" + JSON.stringify(drive) + "'>" + txt + "</option>");
			}
		};
		errorCb = function(response) {
			console.log("ERROR BLAT");
			console.log(response);
		};
		getFlashDrives(true, successCb, errorCb);
	}

	$('body').on('change', '#flashDriveSelect', function() {
		$("#flashDriveSelect option[value='-1']").remove();
		selectedFlashDrive = $.parseJSON(this.value);
		console.log("User select flash drive: " + selectedFlashDrive);
		$("#add-loader").removeClass("disabled")
	});

	$('body').on('click', '.loader-action-chooseiso', function() {
		var loaderId = $(this).data('loader-id');
		var loaderCode = $('select#' + loaderId).find(':selected').data('code');
		successCb = function(response) {
			console.log(response);
			if (response.Error) {
				// TODO think about it because some error means that user just close FileBrowser and we have to handle it
				alert("Internal server error. Please contact to a support. Error: " + response.Error);
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

		errorCb = function(response) {
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

	$("body").on("click", ".loader-action-minimize", function() {
		var id = $(this).data("loader-id");
		// hide task
		$('.loader-task[data-loader-id="' + id + '"]').fadeOut(500);
		// hide status
		$('.loader-status[data-loader-id="' + id + '"]').fadeOut(500);
		// move progressbar
		$('.loader-progressbar[data-loader-id="' + id + '"]').fadeOut().prependTo($('.loader-item[data-loader-id="' + id + '"]')).fadeIn(500);
		// and make it small
		$('.loader-progressbar[data-loader-id="' + id + '"]').find(".progress").addClass("progress-minimized");
		// change button to maximize
		$(this).addClass("loader-action-maximize").removeClass('loader-action-minimize');
		$(this).find("span.glyphicon-minus").removeClass("glyphicon-minus").addClass("glyphicon-plus");
	});

	$("body").on("click", ".loader-action-maximize", function() {
		var id = $(this).data("loader-id");
		// show task
		var task = $('.loader-task[data-loader-id="' + id + '"]');
		task.remove();
		// show status
		var status = $('.loader-status[data-loader-id="' + id + '"]');
		status.remove();
		// move progressbar
		$('.loader-progressbar[data-loader-id="' + id + '"]').fadeOut().appendTo($('.loader-item[data-loader-id="' + id + '"]')).fadeIn(500);
		// append task and status
		status.appendTo($('.loader-item[data-loader-id="' + id + '"]')).fadeIn(500);
		task.appendTo($('.loader-item[data-loader-id="' + id + '"]')).fadeIn(500);
		// and make it small
		$('.loader-progressbar[data-loader-id="' + id + '"]').find(".progress").removeClass("progress-minimized");
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

function burn(loadersJson, mode, flashDriveLetter, async, successCb, errorCb) {
	$.ajax({
		url: "/",
		type: "POST",
		encoding: "UTF8",
		dataType: "JSON",
		data: {
			"Operation": "BurnFlashDrive",
			"FlashDrive": flashDriveLetter,
			"Mode": mode,
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

function getLoaderBurningProgress(loaderId, async, successCb, errorCb) {
	$.ajax({
		url: "/",
		type: "POST",
		dataType: "JSON",
		data: { "Operation": "BurningProgress", "JobNum": loaderId },
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

// commonjs
$.disable = function(el) {
	el.attr('disabled','disabled');
};

$.enable = function(el) {
	el.removeAttr('disabled');
};

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
	var $loaderItemMaximizedRowColXs9InputGrpSelectLoaderType = $("<select>", {"data-loader-id":loaderId, class:"loader-type-select form-control input-sm", style:"width: auto; height: auto; display: inline;"});
	var $loaderItemMaximizedRowColXs9InputGrpSelectLoaderTypeOption1 = $("<option>", {value:"windows7", "data-code":"3", "data-url":"http://yandex.com/", text:"Windows 7, 8, 10, 2008 Server and etc."});
	var $loaderItemMaximizedRowColXs9InputGrpSelectLoaderTypeOption2 = $("<option>", {value:"windowsxp", "data-code":"4", "data-url":"http://yandex.com/", text:"Windows XP, 2003 Server and etc."});
	var $loaderItemMaximizedRowColXs9InputGrpSelectLoaderTypeOption3 = $("<option>", {value:"kav", "data-code":"5", "data-url":"http://yandex.com/", text:"Kasperksy Rescue Disk"});
	var $loaderItemMaximizedRowColXs9InputGrpChooseISOBtn = $("<button>", {"data-loader-id":loaderId, type:"button", class:"loader-action-chooseiso btn btn-default"});
	var $loaderItemMaximizedRowColXs9InputGrpChooseISOBtnGlyph = $("<span>", {class:"glyphicon glyphicon-search", "aria-hidden":"true"});
	var $loaderItemMaximizedRowColXs9InputGrpLinkBtn = $("<button>", {"data-loader-id":loaderId, type:"button", class:"loader-action-linktoiso btn btn-default"});
	var $loaderItemMaximizedRowColXs9InputGrpLinkBtnGlyph = $("<span>", {class:"glyphicon glyphicon-new-window", "aria-hidden":"true"});

	var $loaderItemMaximizedRowColXs3 = $("<div>", {class:"col-xs-3"});
	var $loaderItemMaximizedRowColXs3Buttons = $("<div>", {"data-loader-id":loaderId, class:"loader-actions btn-group btn-group-sm", style:"float: right;", role:"group", "aria-label":"..."});
	var $loaderItemMaximizedRowColXs3EndisableBtn = $("<button>", {"data-loader-id":loaderId, type:"button", class:"loader-action-endisable btn btn-warning", "aria-label":"Left Align"});
	var $loaderItemMaximizedRowColXs3EndisableBtnGlyphIcon = $("<span>", {class:"glyphicon glyphicon-pause", "aria-hidden":"true"});
	var $loaderItemMaximizedRowColXs3MinimizeBtn = $("<button>", {"data-loader-id":loaderId, type:"button", class:"loader-action-minimize btn btn-default", "aria-label":"Left Align"});
	var $loaderItemMaximizedRowColXs3MinimizeBtnGlyphIcon = $("<span>", {class:"glyphicon glyphicon-minus", "aria-hidden":"true"});
	// loader progress bar
	var $loaderItemMinimizedRowProgress = $("<div>", {"data-loader-id": loaderId, class:"row loader-progressbar", style:"margin: 0px;"});
	var $loaderItemMinimizedRowProgressColXs12 = $("<div>", {class:"col-xs-12"});
	var $loaderItemMinimizedRowProgressColXs12ProgressDiv = $("<div>", {"data-loader-id":loaderId, class:"progress", style:"margin-bottom: 0px;"});
	var $loaderItemMinimizedRowProgressColXs12ProgressDivProgressBar = $("<div>", {"data-loader-id":loaderId, class:"progress-bar progress-bar-striped active", role:"progressbar", "aria-valuenow":"0", "aria-valuemin":"0", "aria-valuemax":"100", style:"width: 0%;"});
	var $loaderItemMinimizedRowProgressColXs12ProgressDivProgressBarValueSpan = $("<span>", {"data-loader-id": loaderId, text:"0%"});
	// loader task
	var $loaderItemMaximizedRowTask = $("<div>", {"data-loader-id": loaderId, class:"row loader-task", style:"margin: 0px;"});
	var $loaderItemMaximizedRowTaskColXs12 = $("<div>", {class:"loader-task col-xs-12"});
	var $loaderItemMaximizedRowTaskColXs12Label = $("<label>", {text:"Current task:"});
	var $loaderItemMaximizedRowTaskColXs12LabelSmall = $("<small>", {"data-loader-id":loaderId,class:"loader-task-value", text:""});
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
	$loaderItemMaximizedRowColXs3MinimizeBtn.append($loaderItemMaximizedRowColXs3MinimizeBtnGlyphIcon)
	$loaderItemMaximizedRowColXs3Buttons.append($loaderItemMaximizedRowColXs3MinimizeBtn);
	$loaderItemMaximizedRowColXs3.append($loaderItemMaximizedRowColXs3Buttons)
	$loaderItemMaximizedRow.append($loaderItemMaximizedRowColXs3);
	$loaderItemMaximized.append($loaderItemMaximizedRow);

	$loaderItemMinimizedRowProgressColXs12ProgressDivProgressBar.append($loaderItemMinimizedRowProgressColXs12ProgressDivProgressBarValueSpan);
	$loaderItemMinimizedRowProgressColXs12ProgressDiv.append($loaderItemMinimizedRowProgressColXs12ProgressDivProgressBar);
	$loaderItemMinimizedRowProgressColXs12.append($loaderItemMinimizedRowProgressColXs12ProgressDiv);
	$loaderItemMinimizedRowProgress.append($loaderItemMinimizedRowProgressColXs12);
	$loaderItemMaximized.append($loaderItemMinimizedRowProgress);

	$loaderItemMaximizedRowTaskColXs12Label.append($loaderItemMaximizedRowTaskColXs12LabelSmall);
	$loaderItemMaximizedRowTaskColXs12.append($loaderItemMaximizedRowTaskColXs12Label);
	$loaderItemMaximizedRowTask.append($loaderItemMaximizedRowTaskColXs12);
	$loaderItemMaximized.append($loaderItemMaximizedRowTask);

	$loaderItemMaximizedRowStatusColXs12.append($loaderItemMaximizedRowStatusColXs12Label);
	$loaderItemMaximizedRowStatusColXs12.append($loaderItemMaximizedRowStatusColXs12Small);
	$loaderItemMaximizedRowStatus.append($loaderItemMaximizedRowStatusColXs12);
	$loaderItemMaximized.append($loaderItemMaximizedRowStatus);

	$loaderItem.append($loaderItemMaximized);

	return $loaderItem;
}
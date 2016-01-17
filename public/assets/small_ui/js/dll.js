function log(message) {
	window.dontBlock = true;
	message = JSON.stringify(message);
	$.ajax({
		url: "/",
		type: "POST",
		dataType: "JSON",
		data: { "Operation": "WriteLogMessage", "Message": message},
		async: true,
		success: function (response) {},
		error: function (response) {}
	});
}

function openBrowseDialog(windowTitle, loaderCode, successCb, errorCb) {
	$.ajax({
		url: "/",
		type: "POST",
		dataType: "JSON",
		data: { "Operation":"FlOpnDlg", "Name": "Windows Title", "Id": loaderCode },
		success: function (response) {
			successCb(response);
		},
		error: function (response) {
			errorCb(response);
		}
	})
}

function shutdownServer() {
	$.ajax({
		url: "/",
		type: "POST",
		dataType: "JSON",
		data: { "Operation": "FinishWorks"},
		async: false
	});
}

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
	window.dontBlock = true;
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
	window.dontBlock = true;
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
	window.dontBlock = true;
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
	window.dontBlock = true;
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
	window.dontBlock = true;
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

function getSessionId(async, successCb, errorCb) {
	$.ajax({
		url: "/",
		type: "POST",
		dataType: "JSON",
		data: { "Operation": "GetSessionId" },
		async: async,
		success: function (response) {
			successCb(response);
		},
		error: function (response) {
			errorCb(response);
		}
	});
}

function getLoadersJson(async, successCb, errorCb) {
	$.ajax({
		url: "/",
		type: "POST",
		dataType: "JSON",
		data: { "Operation": "GetExistLoaders" },
		async: async,
		success: function (response) {
			successCb(response);
		},
		error: function (response) {
			errorCb(response);
		}
	});
}
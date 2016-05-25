$(document).ready(function() {

	'use strict';

	$("#winline-navigation").addClass("active");

	$("#launchApp").click(function() {
		var win = window.open("http://bootline.net/winline/app", '_blank');
		win.focus();
	});

	var isIE = isClientBrowserIE();
	if (!isIE) {
		$("#launchApp").remove();
		$(".jbtn").html("<b>This version available only in Internet Explorer.</b>");
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

});
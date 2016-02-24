$(document).ready(function() {

	'use strict';

	$("#winline-navigation").addClass("active");

	$("#launchApp").click(function() {
		var win = window.open("http://bootline.net/winline/app", '_blank');
		win.focus();
	});

});
$(document).ready(function() {
	'use strict';

	$("#social-navigation").addClass("active");

	$(".gratitude-topic").click(function() {
		var topicId = $(this).attr("id");
		window.location = "/social/topic/" + topicId;
	});
});
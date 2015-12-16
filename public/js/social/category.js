$(document).ready(function() {
	'use strict';

	$("#social-navigation").addClass("active");

	$(function() {
		$.ajax({
			url: "/social/getTopicsByCategory",
			type: "POST",
			dataType: "JSON",
			data: {
				"categoryId": $("#category-header").attr("data-categoryid")
			},
			async: false,
			success: function (response) {
				for (var i = 0; i < response.length; i++) {
					var topic = response[i];
					var $container = $('#topic-list');
					renderTopic(topic, $container);
				}
			},
			error: function (response) {}
		});
	});
});
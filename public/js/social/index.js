$(document).ready(function() {
	'use strict';

	$("#social-navigation").addClass("active");

	$(function() {
		$(".category-header").each(function() {
			$.ajax({
				url: "/social/getRevTopicsByCategory",
				type: "POST",
				dataType: "JSON",
				data: {
					"categoryId": $(this).attr("data-categoryid")
				},
				async: false,
				success: function (response) {
					for (var i = 0; i < response.length; i++) {
						var topic = response[i];
						var $container = $('#topic_list[data-categoryid="' + topic.categoryid + '"]');
						renderTopic(topic, $container)
					}
				},
				error: function (response) {}
			});
		});
	});
});
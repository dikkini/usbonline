$(document).ready(function() {
	'use strict';

	$("#social-navigation").addClass("active");

	$("#hide-comments-btn").click(function() {
		$("#comment-list").slideToggle();
		var $element = $(this);
		$element.text(function(i, text) {
			return text == $element.data('default-text') ? $element.data('new-text')
				: $element.data('default-text');
		});
	});

	$("#add-comment-btn").click(function() {
		var commentName = $("#comment-name").val();
		var commentText = $("#comment-text").val();
		var topicId = $("#topicTable").attr("data-topicid");

		$.ajax({
			url: "/social/topic/addComment",
			type: "POST",
			dataType: "JSON",
			data: {
				"commentName": commentName,
				"commentText": commentText,
				"topicId": topicId
			},
			async: true,
			success: function (response) {
				$("#add-comment-modal").modal("hide");
				window.location.reload(true);
			},
			error: function (response) {
				alert("Internal Error. We fixing it..");
			}
		});
	});


});
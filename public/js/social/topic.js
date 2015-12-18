$(document).ready(function() {
	'use strict';

	$.noty.defaults = {
		layout: 'top',
		theme: 'relax', // or 'relax'
		type: 'alert',
		text: '', // can be html or string
		dismissQueue: true, // If you want to use queue feature set this true
		template: '<div class="noty_message"><span class="noty_text"></span><div class="noty_close"></div></div>',
		animation: {
			open: {height: 'toggle'}, // or Animate.css class names like: 'animated bounceInLeft'
			close: {height: 'toggle'}, // or Animate.css class names like: 'animated bounceOutLeft'
			easing: 'swing',
			speed: 500 // opening & closing animation speed
		},
		timeout: 3000, // delay for closing event. Set false for sticky notifications
		force: false, // adds notification to the beginning of queue when set to true
		modal: false,
		maxVisible: 5, // you can set max visible notification for dismissQueue true option,
		killer: false, // for close all notifications before show
		closeWith: ['click'], // ['click', 'button', 'hover', 'backdrop'] // backdrop click will close all notifications
		callback: {
			onShow: function() {},
			afterShow: function() {},
			onClose: function() {},
			afterClose: function() {},
			onCloseClick: function() {},
		},
		buttons: false // an array of buttons
	};

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
		if ($.trim(commentName) == "") {
			noty({
				text: 'Enter your name please!'
			});
			return;
		}
		if ($.trim(commentText) == "") {
			noty({
				text: 'Enter comment text please!'
			});
			return;
		}
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
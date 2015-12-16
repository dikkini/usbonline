$(document).ready(function() {
	'use strict'

	$(function() {
		// Make sure that #header-background-image height is equal to the browser height.

		$('header').css({ 'height': $(window).height() });
		$('section').css({ 'height': $(window).height() });
		$(window).on('resize', function() {
			$('header').css({ 'height': $(window).height() });
			$('section').css({ 'height': $(window).height() - 50 });
			$('body').css({ 'width': $(window).width() })
		});
	});

	$('.smoothscroll').on('click',function (e) {
		e.preventDefault();

		var target = this.hash,
				$target = $(target);

		$('html, body').stop().animate({
			'scrollTop': $target.offset().top
		}, 800, 'swing', function () {
			window.location.hash = target;
		});
	});
});

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

function scroll(height, ele) {
	this.stop().animate({
		scrollTop: height
	}, 1000, function() {
		var dir = height ? "top" : "bottom";
		$(ele).html("scroll to " + dir).attr({
			id: dir
		});
	});
};

function timeSince(date) {

	var seconds = Math.floor((new Date() - date) / 1000);

	var interval = Math.floor(seconds / 31536000);

	if (interval > 1) {
		return interval + " years ago";
	}
	interval = Math.floor(seconds / 2592000);
	if (interval > 1) {
		return interval + " months ago";
	}
	interval = Math.floor(seconds / 86400);
	if (interval > 1) {
		return interval + " days ago";
	}
	interval = Math.floor(seconds / 3600);
	if (interval > 1) {
		return interval + " hours ago";
	}
	interval = Math.floor(seconds / 60);
	if (interval > 1) {
		return interval + " minutes ago";
	}
	return Math.floor(seconds) + " seconds ago";
};
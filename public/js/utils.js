$(document).ready(function() {
	'use strict';

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
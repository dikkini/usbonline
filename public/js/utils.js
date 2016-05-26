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
			onCloseClick: function() {}
		},
		buttons: false // an array of buttons
	};

	$(function() {
		// Make sure that #header-background-image height is equal to the browser height.

		var uno = parseInt($("#winlinePortable").height()) - parseInt($("#winlineOnline").height());
		alert(uno);
		$("#youneedonly").css({'padding-top': uno});
		
		$('header').css({ 'height': $(window).height() - 50 });
		$('section').css({ 'height': $(window).height() - 50 });
		$(window).on('resize', function() {
			var uno = parseInt($("#winlinePortable").height()) - parseInt($("#winlineOnline").height());
			alert(uno);
			$("#youneedonly").css({'padding-top': uno});

			$('header').css({ 'height': $(window).height() });
			$('section').css({ 'height': $(window).height() - 50 });
			$('body').css({ 'width': $(window).width() });
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

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
			(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-73106881-1', 'auto');
ga('send', 'pageview');
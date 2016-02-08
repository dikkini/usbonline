$(document).ready(function() {
	'use strict';

	$("#create-newtopic-btn").click(function() {
		var name = $("#newtopic-name").val();
		var email = $("#newtopic-email").val();
		var topicText = $("#newtopic-text").val();
		var topicSubject = $("#newtopic-subject").val();
		var topicCategory = $("#categoryId").attr("data-category-id");

		if ($.trim(name) == "") {
			noty({
				text: 'Enter your name please!'
			});
			return;
		} else if ($.trim(email) == "") {
			noty({
				text: 'Enter email please!'
			});
			return;
		} else if ($.trim(topicText) == "") {
			noty({
				text: 'Enter new Topic text please!'
			});
			return;
		} else if ($.trim(topicSubject) == "") {
			noty({
				text: 'Enter new Topic subject please!'
			});
			return;
		}

		$("#newtopic-modal").modal("hide");

		$.ajax({
			url: "/social/createTopic",
			type: "POST",
			dataType: "JSON",
			data: {
				"name": name,
				"email": email,
				"topicText": topicText,
				"topicSubject": topicSubject,
				"topicCategory": topicCategory
			},
			async: true,
			success: function (response) {
				var timeLeft = 5,
					cinterval;

				noty({
					timeout: true,
					text: 'Thank you.'
				});
				timeLeft = 4;
				var timeDec = function (){
					noty({
						text: 'Now page will reload in ' + timeLeft + ' seconds'
					});
					timeLeft--;
					if(timeLeft === 0){
						clearInterval(cinterval);
						window.location.reload();
					}
				};

				cinterval = setInterval(timeDec, 1000);

			},
			error: function (response) {
			}
		});
	});
});
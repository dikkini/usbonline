
var $body = $("body");

function renderTopic(topic, $container) {
	var topicDateStr = topic.createddate;
	var topicDate = new Date(topicDateStr);
	var since = timeSince(topicDate);

	var html = '<a data-topicid="' + topic.id + '" href="/social/topic/' + topic.id + '" class="topic list-group-item">' +
		'<div class="row">' +
		'<div class="col-xs-8">' +
		'<h4 class="list-group-item-heading topic-subject">' + topic.subject + '</h4>' +
		'</div>' +
		'<div class="col-xs-4">' +
		'<small>' + since + '</small>' +
		'</div>' +
		'</div>' +
		'<p class="list-group-item-text topic-text">' + topic.text + '</p>' +
		'</a>';

	$container.append(html);
}

$body.on("click", ".topic", function() {

});
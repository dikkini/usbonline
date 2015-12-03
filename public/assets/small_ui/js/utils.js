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
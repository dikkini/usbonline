var sha1 = require('sha1')
	, jsSHA = require("jssha")
	, log = require('../libs/log')(module);


function _genHash(data) {
	var d = data.split("").reverse().join("").substring(0, data.length - 1);
	log.debug("Wrecked data: " + d);
	var key = "KeyY";
	var shaObj = new jsSHA("SHA-1", "TEXT");
	shaObj.setHMACKey(key, "TEXT");
	shaObj.update(d);
	var hmac = shaObj.getHMAC("HEX");
	return hmac;
}

module.exports = {
	isRSAValid: function (body) {
		var rsa = body.RSA;
		log.debug("RSA: " + rsa);
		log.debug("Generate data for RSA check");
		var data = "";
		for (var el in body) {
			if (el == "RSA") {
				log.debug("Miss RSA: " + el);
				continue;
			}
			if (body.hasOwnProperty(el)) {
				data += "\"";
				data += JSON.stringify(body[el]);
				data += "\"";
			}
		}
		log.debug("Got data: " + data);

		var cRsa = _genHash(data);
		cRsa = cRsa.toUpperCase();
		log.debug("New RSA: " + cRsa);

		return cRsa == rsa;
	}
};
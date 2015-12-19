var express = require('express')
	, router = express.Router()
	, sha1 = require('sha1')
	, jsSHA = require("jssha")
	, log = require('../libs/log')(module)
	, db = require('../service/db')
	, sockets = require('../service/sockets')
	, config = require('../libs/config');

router.post('/setPort', function(req, res, next) {

	var response = {
		"success": true
	};

	var sessionId = req.body.id;
	log.debug("SessionId: " + sessionId);
	var port = req.body.port;
	log.debug("port: " + port);

	var rsa = req.body.RSA;
	log.debug("RSA: " + rsa);
	log.debug("Generate data for RSA check");
	var rsaData = sessionId + port;

	var isValid = isRSAValid(rsa, rsaData);

	if (!isValid) {
		response.success = false;
		res.status = 500;
		return res.end(JSON.stringify(response));
	}

	log.debug("Build data for socket transport");
	var data = {
		op: "launchapp",
		port: port
	};
	log.debug("Built! Data: " + JSON.stringify(data));

	log.debug("Return response: " + JSON.stringify(response));

	log.debug("Socket emit");
	var success = sockets.emit(sessionId, data);
	if (success) {
		return res.end(JSON.stringify(response));
	}

});

router.post('/feedback_win', function(req, res, next) {
	log.debug("BODY: " + JSON.stringify(req.body));
});

router.post('/feedback', function(req, res, next) {
	log.debug("BODY: " + JSON.stringify(req.body));

	var response = {
		"success": true
	};

	var name = req.body.nick;
	log.debug("Name: " + name);
	var email = req.body.email;
	log.debug("Email: " + email);
	var subject = req.body.subject;
	log.debug("Subject: " + subject);
	var feedback = req.body.feedback;
	log.debug("Feedback: " + feedback);
	var sessionid = req.body.id;
	log.debug("Session Id: " + sessionid);
	var categoryid = req.body.type;
	log.debug("Category Id: " + categoryid);

	var rsa = req.body.RSA;
	log.debug("RSA: " + rsa);
	log.debug("Generate data for RSA check");
	// {"type":"1","email":"C","nick":"D","feedback":"B","subject":"A","id":"C8B44286668444EBB3B015F7A49A63E8","RSA":"83FA34FB956B509DDF98796010E494EAD969781B"}
	var data = categoryid+email+name+feedback+subject+sessionid;

	var isValid = isRSAValid(rsa, data);

	if (!isValid) {
		response.success = false;
		res.status = 500;
		return res.end(JSON.stringify(response));
	}

	var isOnline = req.body.online;

	if (!isOnline) {
		log.debug("Create user session");
		db.query(config.get("sql:create_user_session"), [sessionid, new Date()], function (err, result) {

			log.debug(result);
			if (err) {
				log.error(err);
				response.success = false;
				response.errorMessage = err;
				return res.end(JSON.stringify(response));
			}
			log.debug("Add user feedback to database");
			db.query(config.get("sql:add_user_topic"), [sessionid, subject, feedback, name, email, categoryid, false, new Date()], function (err, result) {
				log.debug(result);
				if (err) {
					response.success = false;
					response.errorMessage = err;
					log.error(err);
				} else {
					log.debug("User feedback successfully added!");
				}
				return res.end(JSON.stringify(response));
			});
		});
	} else {
		log.debug("Add user feedback to database");
		db.query(config.get("sql:add_user_topic"), [sessionid, subject, feedback, name, email, categoryid, true, new Date()], function (err, result) {
			log.debug(result);
			if (err) {
				response.success = false;
				response.errorMessage = err;
				log.error(err);
			} else {
				log.debug("User feedback successfully added!");
			}
			return res.end(JSON.stringify(response));
		});
	}
});

function isRSAValid(rsa, data) {
	log.debug("Data: " + data);
	var cRsa = genHash(true, data);
	log.debug("New RSA when data was reversed: " + cRsa);

	if (cRsa != rsa) {
		cRsa = genHash(false, data);
		log.debug("New RSA when data was NOT reversed: " + cRsa);
	}

	return cRsa == rsa;
}

function genHash(reverse, data) {
	var d;
	if (reverse) {
		d = data.split("").reverse().join("").substring(0, data.length - 1);
	} else {
		d = data.substring(0, data.length - 1);
	}
	log.debug("Wrecked data: " + d);
	var key = "KeyY";
	var shaObj = new jsSHA("SHA-1", "TEXT");
	shaObj.setHMACKey(key, "TEXT");
	shaObj.update(d);
	var hmac = shaObj.getHMAC("HEX");

	shaObj = new jsSHA("SHA-1", "TEXT");
	shaObj.update(d);
	var hash = shaObj.getHash("HEX");

	return hmac;
}

router.post('/userinfo', function(req, res, next) {
	log.debug("Collect user info");
	var sessionid = req.body.sessionId;
	var appcodename = req.body.codeName;
	var appname = req.body.appName;
	var appversion = req.body.appVersion;
	var language = req.body.language;
	var platform = req.body.platform;
	var useragent = req.body.userAgent;
	var javaenabled = req.body.javaEnabled;
	var cookiesenabled = req.body.cookiesEnabled;
	var browserversion = req.body.version;

	var createdDate = new Date();

	var response = {
		"success": true
	};

	log.debug("Create user session");
	db.query(config.get("sql:create_user_session"), [sessionid, createdDate], function (err, result) {

		log.debug(result);
		if (err) {
			log.error(err);
			response.success = false;
			response.errorMessage = err;
			return res.end(JSON.stringify(response));
		}
		log.debug("Save userinfo");
		db.query(config.get("sql:add_user_browser_info"), [sessionid, appcodename, appname, appversion, language, platform, useragent, javaenabled, cookiesenabled, browserversion, createdDate], function (err, result) {

			log.debug(result);
			if (err) {
				log.error(err);
				response.success = false;
				response.errorMessage = err;
			}
			return res.end(JSON.stringify(response));
		});
	});
});

module.exports = router;
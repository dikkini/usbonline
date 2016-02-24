var express = require('express')
	, router = express.Router()
	, jsSHA = require("jssha")
	, log = require('../libs/log')(module)
	, db = require('../service/db')
	, tools = require("../libs/tools")
	, sockets = require('../service/sockets')
	, config = require('../libs/config');

router.post('/setPort', function(req, res, next) {

	log.debug("BODY: " + JSON.stringify(req.body));

	var response = {
		"success": true
	};

	var isValid = tools.isRSAValid(req.body);

	if (!isValid) {
		log.error("RSA does not equals.");
		response.success = false;
		res.status = 500;
		return res.end(JSON.stringify(response));
	}

	var sessionId = req.body.id;
	log.debug("SessionId: " + sessionId);
	var port = req.body.port;
	log.debug("Port: " + port);


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

router.post('/feedback', function(req, res, next) {
	log.debug("BODY: " + JSON.stringify(req.body));

	var response = {
		"success": true
	};

	var isValid = tools.isRSAValid(req.body);

	if (!isValid) {
		log.error("RSA does not equals.");
		response.success = false;
		res.status = 500;
		return res.end(JSON.stringify(response));
	}

	var operation = req.body.Operation;
	log.debug("Operation: " + operation);
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
	var isOnline = req.body.online;
	log.debug("Is Online?: " + categoryid);
	var time = req.body.time;
	log.debug("Time: " + time);
	var timeoffset = req.body.offset;
	log.debug("Time Offset: " + timeoffset);

	if (!isOnline) {
		isOnline = false;
	}

	db.query(config.get("sql:social:add_user_topic"), [sessionid, subject, feedback, name, email, categoryid, isOnline, new Date()], function (err, result) {
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

router.post('/userinfo', function(req, res, next) {
	log.debug("Collect user info");
	var sessionid = req.body.id;
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

	db.query(config.get("sql:users:add_user_browser_info"), [sessionid, appcodename, appname, appversion, language, platform, useragent, javaenabled, cookiesenabled, browserversion, createdDate], function (err, result) {

		log.debug(result);
		if (err) {
			log.error(err);
			response.success = false;
			response.errorMessage = err;
		}
		return res.end(JSON.stringify(response));
	});
});

router.post('/startappbtn', function (req, res, next) {
	log.debug("startappbtn");
	var isIE = req.body.IE;
	log.debug("IsIE: " + isIE);
	if (isIE == "true") {
		db.query(config.get("sql:stats:update_pressedstartapp"), [], function (err, result) {
			log.debug(result);
			if (err) {
				log.error(err);
			}
		});
	} else if (isIE == "false") {
		db.query(config.get("sql:stats:update_pressedstartapp_chrome"), [], function (err, result) {
			log.debug(result);
			if (err) {
				log.error(err);
			}
		});
	}
	var response = {
		"success": true
	};
	return res.end(JSON.stringify(response));
});

module.exports = router;
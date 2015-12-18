var express = require('express')
	, router = express.Router()
	, log = require('../libs/log')(module)
	, db = require('../service/db')
	, sockets = require('../service/sockets')
	, config = require('../libs/config');

router.post('/setPort', function(req, res, next) {
	var sessionId = req.body.id;
	log.debug("SessionId: " + sessionId);
	var port = req.body.port;
	log.debug("port: " + port);

	var response = {
		"success": true
	};

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
	log.debug("BODY: " + req.body);
});

router.post('/feedback', function(req, res, next) {
	var name = req.body.name;
	log.debug("Name: " + name);
	var email = req.body.email;
	log.debug("Email: " + email);
	var feedback = req.body.feedback;
	log.debug("Feedback: " + feedback);
	var sessionid = req.body.sessionId;
	log.debug("Session Id: " + sessionid);
	var categoryid = req.body.categoryId;
	log.debug("Category Id: " + categoryid);


	var response = {
		"success": true
	};

	log.debug("Add user feedback to database");
	db.query(config.get("sql:add_user_topic"), [sessionid, feedback, email, categoryid, false], function (err, result) {
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
	db.query(config.get("sql:create_user_session"), [sessionid, appcodename, appname, appversion, language, platform, useragent, javaenabled, cookiesenabled, browserversion, createdDate], function (err, result) {

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
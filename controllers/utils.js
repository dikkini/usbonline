var express = require('express')
	, router = express.Router()
	, log = require('../libs/log')(module)
	, db = require('../service/db')
	, pg = require('pg')
	, config = require('../libs/config')
	, fs = require('fs');

router.post('/setPort', function(req, res, next) {
	var body = req.body;

	console.log(body);

	var response = {
		"success": true
	};

	return res.end(JSON.stringify(response));
});

router.post('/feedback', function(req, res, next) {
	var feedback_email = req.body.email;
	var feedback = req.body.feedback;
	var sessionid = req.body.sessionId;


	var response = {
		"success": true
	};

	db.query(config.get("sql:add_user_feedback"), [feedback_email, feedback, sessionid], function (err, result) {

		log.debug(result);
		log.error(err);
		if (err) {
			response.success = false;
			response.errorMessage = err;
		}
		return res.end(JSON.stringify(response));
	});
});

router.post('/userinfo', function(req, res, next) {
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

	var startdate = new Date();

	var response = {
		"success": true
	};

	db.query(config.get("sql:save_user_info"), [sessionid, startdate, appcodename, appname, appversion, language,
		platform, useragent, javaenabled, cookiesenabled, browserversion], function (err, result) {

		log.debug(result);
		log.error(err);
		if (err) {
			response.success = false;
			response.errorMessage = err;
		}
		return res.end(JSON.stringify(response));
	});
});

module.exports = router;
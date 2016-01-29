var express = require('express')
	, router = express.Router()
	, db = require('../service/db')
	, tools = require("../libs/tools")
	, config = require('../libs/config')
	, log = require('../libs/log')(module);


router.post('/', function (req, res, next) {
	log.debug("Got log");
	log.debug("BODY: " + JSON.stringify(req.body));

	var response = {
		"success": true
	};

	var isValid = tools.isRSAValid(req.body);

	if (!isValid) {
		log.warning("WARNING!!! RSA does not equals. ")
		response.success = false;
		res.status = 500;
		return res.end(JSON.stringify(response));
	}

	var sessionId = req.body.id;
	var time = req.body.time;
	var timeoffset = req.body.offset;
	var message = JSON.stringify(req.body.msg);
	var type = req.body.type;

	if (!time) {
		time = "01012016183658"
	}

	log.debug("Save log");
	db.query(config.get("sql:utils:save_log"), [sessionId, time, "DDMMYYYYHH24MISS", timeoffset, message, type], function (err, result) {
		log.debug(result);
		if (err) {
			log.error(err);
			response.success = false;
			response.errorMessage = err;
			return res.end(JSON.stringify(response));
		}
		log.debug("Saved!");
		return res.end(JSON.stringify(response));
	});
});

module.exports = router;
var express = require('express')
	, router = express.Router()
	, db = require('../service/db')
	, config = require('../libs/config')
	, log = require('../libs/log')(module);


router.post('/', function (req, res, next) {
	log.debug("Got log");
	var sessionId = req.body.id;
	var time = req.body.time;
	var timeoffset = req.body.offset;
	var message = JSON.stringify(req.body.msg);
	var type = req.body.type;

	var response = {
		"success": true
	};

	log.debug("Save log");
	db.query(config.get("sql:utils:save_log"), [sessionId, time, timeoffset, message, type], function (err, result) {
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
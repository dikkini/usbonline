var express = require('express')
	, router = express.Router()
	, db = require('../service/db')
	, log = require('../libs/log')(module);


router.post('/', function (req, res, next) {
	log.debug("Got log");
	var sessionId = req.body.id;
	var time = req.body.Time;
	var timeoffset = req.body.Offset;
	var message = JSON.stringify(req.body.msg);
	var type = req.body.Type;
	var f1 = req.body.F1;
	var f2 = req.body.F2;
	var f3 = req.body.F3;
	var f4 = req.body.F4;

	var response = {
		"success": true
	};

	log.debug("Save log");
	db.query(config.get("sql:utils:save_log"), [sessionId, time, timeoffset, message, type, f1, f2, f3, f4], function (err, result) {
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
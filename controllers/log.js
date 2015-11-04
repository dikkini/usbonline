var express = require('express')
	, router = express.Router()
	, log = require('../libs/log')(module)
	, fs = require('fs');

router.post('/', function (req, res, next) {
	var id = req.body.id;
	var logMsg = req.body.msg.toString();

	var response = {
		"success": true
	};

	log.debug("Income id:" + id);
	log.debug("Income logMsg: " + logMsg);


	fs.exists('/tmp/usbonline/logs/' + id, function (exists) {
		if (exists) {
			fs.appendFile("/tmp/usbonline/logs/" + id, logMsg + "\n", function (err) {
				if (err) {
					log.error(err);
					response.success = false;
					return res.end(JSON.stringify(response));
				}
				log.info("Log done");
				return res.end(JSON.stringify(response));
			});
		} else {
			fs.writeFile("/tmp/usbonline/logs/" + id, logMsg + "\n", function (err) {
				if (err) {
					log.error(err);
					response.success = false;
					return res.end(JSON.stringify(response));
				}
				log.info("Log done");
				return res.end(JSON.stringify(response));
			});
		}
	});
});

router.get('/:id', function (req, res, next) {
	var id = req.params.id;
	var response = {
		"success": false,
		"logFile": "file not found"
	};
	fs.exists('/tmp/usbonline/logs/' + id, function (exists) {
		if (exists) {
			fs.readFile('/tmp/usbonline/logs/' + id, function (err, data) {
				if (err) {
					return log.error(err);
				}
				return res.end(data);
			});
		} else {
			return res.end(JSON.stringify(response));
		}
	});
});

module.exports = router;
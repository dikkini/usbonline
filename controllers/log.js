var express = require('express')
	, router = express.Router()
	, log = require('../libs/log')(module)
	, fs = require('fs');

router.post('/', function (req, res, next) {
	var id = req.body.id;
	var logMsg = JSON.stringify(req.body.msg);

	var response = {
		"success": true
	};

	log.debug("Income id:" + id);
	log.debug("Income logMsg: " + logMsg);


	fs.exists('/home/winusb/portable_logs/' + id, function (exists) {
		if (exists) {
			fs.appendFile("/home/winusb/portable_logs/" + id, logMsg + "\n", function (err) {
				if (err) {
					log.error(err);
					response.success = false;
					return res.end(JSON.stringify(response));
				}
				log.info("Log done");
				return res.end(JSON.stringify(response));
			});
		} else {
			fs.writeFile("/home/winusb/portable_logs/" + id, logMsg + "\n", function (err) {
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
	fs.exists('/home/winusb/portable_logs/' + id, function (exists) {
		if (exists) {
			fs.readFile('/home/winusb/portable_logs/' + id, function (err, data) {
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
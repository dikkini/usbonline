var express = require('express')
	, router = express.Router()
	, log = require('../libs/log')(module)
	, fs = require('fs');

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', {title: 'Online USB Make'});
});
router.get('/usb', function (req, res, next) {
	res.render('usb', {title: 'Online USB Make', ip: "http://localhost:8080/"});
});

router.get('/usb1', function (req, res, next) {
	res.render('usb', {title: 'Online USB Make', ip: "http://10.211.55.3:8080/"});
});

router.post('/log', function (req, res, next) {
	var id = req.body.Id;
	var logMsg = req.body.Msg;

	if (!id.trim() || !logMsg.trim()) {
		throw new Error("Bad request");
	}

	try {
		logMsg = JSON.stringify();
	} catch (e) {
		throw new Error("Wrong format.");
	}

	log.debug("Income id:" + id);
	log.debug("Income logMsg: " + logMsg);

	var response = {
		"success": true
	};
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

router.get('/log/:id', function (req, res, next) {
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

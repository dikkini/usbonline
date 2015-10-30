var express = require('express')
	, router = express.Router()
	, config = require('../libs/config')
	, log = require('../libs/log')(module)
	, path = require('path');

router.get('/application', function (req, res, next) {
	var file = __dirname + '/opt/bootline/BootLine.exe';
	res.download(file); // Set disposition and send it.
});

router.get('/clickonce', function (req, res, next) {
	var file = __dirname + '/opt/bootline/clickonce/BootLineCO.application';
	res.download(file); // Set disposition and send it.
});


module.exports = router;
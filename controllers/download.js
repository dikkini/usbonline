var express = require('express')
	, router = express.Router()
	, config = require('../libs/config')
	, log = require('../libs/log')(module)
	, path = require('path');

router.get('/application', function (req, res, next) {
	var file = '/opt/bootline/BootLine.exe';
	res.download(file); // Set disposition and send it.
});


module.exports = router;
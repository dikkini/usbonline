var express = require('express')
	, router = express.Router()
	, config = require('../libs/config')
	, log = require('../libs/log')(module)
	, path = require('path');

router.get('/Application%20Files/:version/:file', function (req, res, next) {
	var version = req.params.version;
	log.debug(version);
	var fileName = req.params.file;
	log.debug(fileName);
	var file = '/opt/bootline/clickonce/Application Files/' + version + '/' + fileName;
	res.download(file); // Set disposition and send it.
});


module.exports = router;
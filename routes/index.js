var express = require('express')
	, router = express.Router()
	, config = require('../libs/config')
	, log = require('../libs/log')(module);

router.get('/', function (req, res, next) {
	res.render('index', {title: 'Online USB Make', ip: "http://localhost:" + config.get('iframe:port') });
});

router.get('/dev', function (req, res, next) {
	res.render('index', {title: 'Online USB Make', ip: "http://10.211.55.3:8080/"});
});

module.exports = router;

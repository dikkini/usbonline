var express = require('express')
	, router = express.Router()
	, config = require('../libs/config')
	, log = require('../libs/log')(module);

router.get('/', function (req, res, next) {
	res.render('index');
});

router.get('/app', function (req, res, next) {
	res.render('app');
});

module.exports = router;

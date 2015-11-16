var express = require('express')
	, router = express.Router()
	, config = require('../libs/config')
	, log = require('../libs/log')(module);

router.get('/', function (req, res, next) {
	res.render('index');
});

router.get('/new', function (req, res, next) {
	res.render('index_new');
});

router.get('/new2', function (req, res, next) {
	res.render('index2_new');
});

module.exports = router;

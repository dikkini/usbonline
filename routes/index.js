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

module.exports = router;

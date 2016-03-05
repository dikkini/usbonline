var express = require('express')
	, router = express.Router()
	, log = require('../libs/log')(module)
	, db = require('../service/db')
	, async = require('async')
	, config = require('../libs/config');

router.get('/', function (req, res, next) {
	res.render('library/articles/index');
});

router.get('/how-to-make-kasperksy-live-cd-to-usb', function (req, res, next) {
	res.render('library/articles/article', {"article": "kaspersky"});
});

router.get('/how-to-make-clonezilla-live-cd-to-usb', function (req, res, next) {
	res.render('library/articles/article', {"article": "clonezilla"});
});

router.get('/how-to-make-avg-rescue-disk-to-usb', function (req, res, next) {
	res.render('library/articles/article', {"article": "avg"});
});

router.get('/how-to-make-drweb-live-disk-to-usb', function (req, res, next) {
	res.render('library/articles/article', {"article": "drweb"});
});

router.get('/how-to-make-ubuntu-linux-to-usb', function (req, res, next) {
	res.render('library/articles/article', {"article": "ubuntu"});
});


module.exports = router;
var express = require('express')
	, router = express.Router()
	, config = require('../libs/config')
	, log = require('../libs/log')(module);

router.get('/', function (req, res, next) {

	var from = req.query.from;
	var to = req.query.to;
	if (from) {
		// TODO save to db
	}

	if (!to) {
		res.render('index');
	} else if (to == 0) {
		res.redirect("/")
	} else if (to == 1) {
		res.redirect("/social")
	} else if (to == 2) {
		res.redirect("/about")
	} else if (to == 3) {
		res.redirect("/eula")
	} else {
		res.render('index');
	}
});

router.get('/online', function (req, res, next) {
	res.render('online');
});

router.get('/download', function (req, res, next) {
	res.render('download');
});

router.get('/about', function (req, res, next) {
	res.render('about');
});

router.get('/eula', function (req, res, next) {
	res.render('eula');
});

module.exports = router;

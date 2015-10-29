var express = require('express')
	, router = express.Router()
	, log = require('../libs/log')(module)
	, fs = require('fs');

router.post('/setport', function(req, res, next) {
	var json = req.body.JSON;

	console.log(json);

	var response = {
		"success": true
	};

	return res.end(JSON.stringify(response));
});

module.exports = router;
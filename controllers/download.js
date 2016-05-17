var express = require('express')
	, router = express.Router()
	, config = require('../libs/config')
	, db = require('../service/db')
	, log = require('../libs/log')(module)
	, path = require('path')
	, fs = require('fs')
	, mime = require('mime');

router.get('/application', function (req, res, next) {
	log.debug("Download portable application");

	var file = '/opt/bootline/BootLine.exe';

	db.query(config.get("sql:stats:update_downloadportable"), [], function (err, result) {
		log.debug(result);
		if (err) {
			log.error(err);
		}
	});

	try {
		fs.readFileSync(file);
	} catch (ex) {
		log.error(ex);
		res.status(404);
		log.debug("File not found: " + file);
		res.render('errors/404', {error: '404 Oops.. File not found! Sorry..'});
		return;
	}

	res.download(file); // Set disposition and send it.
});

router.get('/winline', function (req, res, next) {
	log.debug("Download winline application");

	var file = '/opt/winline/WinLine.exe';

	try {
		fs.readFileSync(file);
	} catch (ex) {
		log.error(ex);
		res.status(404);
		log.debug("File not found: " + file);
		res.render('errors/404', {error: '404 Oops.. File not found! Sorry..'});
		return;
	}

	res.download(file); // Set disposition and send it.
});

router.get('/online', function (req, res, next) {
	log.debug("Download ONLINE exe");

	var sessionId = req.query.sessionId;
	var buf;
	try {
		buf = new Buffer(sessionId);
	} catch (ex) {
		log.error(ex);
		return;
	}

	var file = '/opt/bootline/BootLine.exe';

	var filename = path.basename(file);
	var mimetype = mime.lookup(file);

	res.setHeader('Content-disposition', 'attachment; filename=' + filename);
	res.setHeader('Content-type', mimetype);

	try {
		var content = fs.readFileSync(file);
	} catch (ex) {
		log.error(ex);
		res.status(404);
		log.debug("File not found: " + file);
		res.render('errors/404', {error: '404 Oops.. File not found! Sorry..'});
	}
	var cnt = 5386176;
	for (var i = 0; i < buf.length; i++) {
		content[cnt] = buf[i];
		cnt++;
	}

	res.end(content);

});


module.exports = router;
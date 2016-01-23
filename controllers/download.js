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
	res.download(file, function (err) {
		if (err) {
			// Check if headers have been sent
			if (res.headersSent) {
				db.query(config.get("sql:stats:update_downloadportable"), [], function (err, result) {
					log.debug(result);
					if (err) {
						log.error(err);
					}
				});
			} else {
				log.debug("Not found file : " + file);
				return res.sendStatus(404); // 404, maybe 500 depending on err
			}
		}
	}); // Set disposition and send it.
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

	var content = fs.readFileSync(file);
	var cnt = 5232512;
	for (var i = 0; i < buf.length; i++) {
		content[cnt] = buf[i];
		cnt++;
	}

	res.end(content);

});


module.exports = router;
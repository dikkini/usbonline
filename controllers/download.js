var express = require('express')
	, router = express.Router()
	, config = require('../libs/config')
	, db = require('../service/db')
	, log = require('../libs/log')(module)
	, path = require('path');

router.get('/application', function (req, res, next) {
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


module.exports = router;
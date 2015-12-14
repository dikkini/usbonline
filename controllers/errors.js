var express = require('express')
	, app = express()
	, router = express.Router()
	, config = require('../libs/config')
	, log = require('../libs/log')(module);

router.use(function(req, res, next){
	res.status(404);
	log.debug('Not found URL: %s', req.url);
	res.render('errors/404', {error: '404 Oops.. Page not found! Sorry..'});
});

// uncomment in production env
//app.use(function(err, req, res, next){
//    res.status(err.status || 500);
//    log.error('Internal error(%d): %s',res.statusCode,err.message);
//    res.render('errors/500');
//});


// development error handler will print stacktrace
// comment in production env
if (app.get('env') === 'development') {
	router.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('errors/error', {
			message: err.message,
			error: err
		});
	});
}

module.exports = router;
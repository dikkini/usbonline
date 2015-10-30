var express = require("express")
    , app = express()
    , ejs = require('ejs')
    , config = require('./libs/config')
    , bodyParser = require("body-parser")
    , compression = require('compression')
    , path = require('path')
    , _ = require("underscore")
    , favicon = require('serve-favicon')
    , logger = require('morgan')
    , cookieParser = require('cookie-parser')
    , methodOverride = require('method-override')
    , log = require('./libs/log')(module)
    , index = require('./routes/index')
    , logs = require('./routes/log')
    , utils = require('./routes/utils')
    , session = require('./routes/session')
    , download = require('./routes/download');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(methodOverride('X-HTTP-Method-Override')); // put and delete methods
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/log', logs);
app.use('/utils', utils);
app.use('/session', session);
app.use('/download', download);

// error handlers

app.use(function(req, res, next){
    res.status(404);
    log.debug('Not found URL: %s',req.url);
    res.render('errors/404', {error: 'Oops.. Page not found! Sorry..'});
});

// uncomment in production env
//app.use(function(err, req, res, next){
//    res.status(err.status || 500);
//    log.error('Internal error(%d): %s',res.statusCode,err.message);
//    res.render('errors/500', {error: err.message});
//});


// development error handler will print stacktrace
// comment in production env
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('errors/error', {
            message: err.message,
            error: err
        });
    });

    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('errors/error', {
            message: err.message,
            error: {}
        });
    });
}

module.exports = app;

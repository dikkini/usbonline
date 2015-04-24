var express = require("express")
    , app = express()
    , config = require('./libs/config')
    , bodyParser = require("body-parser")
    , path = require('path')
    , _ = require("underscore")
    , favicon = require('serve-favicon')
    , logger = require('morgan')
    , cookieParser = require('cookie-parser')
    , methodOverride = require('method-override')
    , log = require('./libs/log')(module)
    , routes = require('./routes/index');
    //, api = require('./routes/api');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride('X-HTTP-Method-Override')); // put and delete methods
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
//app.use('/api', api);

//app.use(function(req, res, next){
//    res.status(404);
//    log.debug('Not found URL: %s',req.url);
//    res.send({ error: 'Not found' });
//});
//
//app.use(function(err, req, res, next){
//    res.status(err.status || 500);
//    log.error('Internal error(%d): %s',res.statusCode,err.message);
//    res.send({ error: err.message });
//});


//// catch 404 and forward to error handler
//app.use(function(req, res, next) {
//    var err = new Error('Not Found');
//    err.status = 404;
//    next(err);
//});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });

    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });
}

module.exports = app;

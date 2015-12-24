var express = require("express")
    , app = express()
    , ejs = require('ejs')
    , config = require('./libs/config')
    , bodyParser = require("body-parser")
    , compression = require('compression')
    , path = require('path')
    , _ = require("underscore")
    , favicon = require('serve-favicon')
    , cookieParser = require('cookie-parser')
    , methodOverride = require('method-override')
	, expressLog = require('./libs/expressLog')
    , index = require('./controllers/index')
    , logs = require('./controllers/log')
    , db = require('./service/db')
    , utils = require('./controllers/utils')
    , download = require('./controllers/download')
    , clickonce = require('./controllers/clickonce')
    , social = require('./controllers/social')
    , uuid = require('node-uuid')
    , errors = require('./controllers/errors')
    , log = require('./libs/log')(module);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser("{fjc{fjc"));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(methodOverride('X-HTTP-Method-Override')); // put and delete methods
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));

app.use(expressLog());

app.use(function(req, res, next) {
    var track = req.cookies['track_id'];
    if (!track) {
        // set cookie
        res.cookie('track_id', uuid.v4(), { maxAge: 900000, httpOnly: true });
        // update count
        db.query(config.get("sql:stats:update_count_users"), [], function (err, result) {
            log.debug(result);
            if (err) {
                log.error(err);
            }
        });
    }
    next();
});

app.use('/', index);
app.use('/log', logs);
app.use('/utils', utils);
app.use('/download', download);
app.use('/clickonce', clickonce);
app.use('/social', social);
app.use(errors);

module.exports = app;

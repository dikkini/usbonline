var express = require('express')
    , router = express.Router()
    , log = require('../libs/log')(module)
    , fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Online USB Make' });
});

router.get('/usb', function(req, res, next) {
  res.render('usb', { title: 'Online USB Make', ip: "http://10.211.55.3:8080/" });
});

router.post('/log', function(req, res, next) {
    var id = req.body.Id;
    var logMsg = req.body.Msg;
    fs.exists('/etc/passwd', function (exists) {
        util.debug(exists ? "it's there" : "no passwd!");
        if (exists) {
            fs.appendFile("/tmp/usbonline/logs/" + id, logMsg, function(err) {
                if (err) {
                    res.end({"success" : false});
                    return log.error(err);
                }
                log.info("Log done");
                res.end({"success" : true});
            });
        } else {
            fs.writeFile("/tmp/usbonline/logs/" + id, logMsg, function(err) {
                if (err) {
                    res.end({"success" : false});
                    return log.error(err);
                }
                log.info("Log done");
                res.end({"success" : true});
            });
        }
    });
});

router.get('/log/:id', function(req, res, next) {
    var id = req.params.id;
    fs.readFile('/tmp/usbonline/logs/' + id, function (err, data) {
        if (err) {
            return log.error(err);
        }
        res.end(data);
    });
});

module.exports = router;

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

    var response = {
        "success": true
    };
    fs.exists('/etc/passwd', function (exists) {
        if (exists) {
            fs.appendFile("/tmp/usbonline/logs/" + id, logMsg, function(err) {
                if (err) {
                    log.error(err);
                    response.success = false;
                    return res.end(JSON.stringify(response));
                }
                log.info("Log done");
                return res.end(JSON.stringify(response));
            });
        } else {
            fs.writeFile("/tmp/usbonline/logs/" + id, logMsg, function(err) {
                if (err) {
                    log.error(err);
                    response.success = false;
                    return res.end(JSON.stringify(response));
                }
                log.info("Log done");
                return res.end(JSON.stringify(response));
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

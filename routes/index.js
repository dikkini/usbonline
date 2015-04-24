var express = require('express')
    , router = express.Router()
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
    var log = req.body.Msg;
    fs.writeFile("/tmp/usbonline/logs/" + id, log, function(err) {
        if (err) {
            return log.error(err);
        }
        log.info("Log done");
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

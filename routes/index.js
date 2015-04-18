var express = require('express')
    , router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Online USB Make' });
});

router.get('/usb', function(req, res, next) {
  res.render('usb', { title: 'Online USB Make', ip: "http://10.211.55.3:8080/" });
});

module.exports = router;

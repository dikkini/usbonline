var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  //res.render('usb', { title: 'WinUSBOnline', ip: "http://10.211.55.3:8080/" });
  res.render('usb', { title: 'WinUSBOnline', ip: "http://localhost:8080/" });
});

module.exports = router;
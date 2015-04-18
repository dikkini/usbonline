var mongoose = require('mongoose')
	, log = require('./log')(module)
	, config = require('./config');

mongoose.connect(config.get('mongoose:uri'));
var db = mongoose.connection;

db.on('error', function (err) {
	log.error('connection error:', err.message);
});
db.once('open', function callback() {
	log.info("Connected to DB!");
});

var Schema = mongoose.Schema;

var ClientSession = new Schema({
	userId: {type: String, required: true},
	startTime: {type: Date, default: Date.now},
	clientTime: {type: Date, required: true},
	endTime: {type: Date},
	premium: {type: Boolean, required: true},
	modified: {type: Date, default: Date.now}
});

var ClientSessionModel = mongoose.model('ClientSession', ClientSession);

module.exports.SessionModel = ClientSessionModel;
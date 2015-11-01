var config = require('../libs/config')
	, pg = require('pg')
	, log = require('../libs/log')(module);

module.exports = {
	query: function(sql, values, cb) {
		pg.connect(config.get('postgres:uri'), function(err, client, done) {
			if (err) {
				log.error(err);
				return cb(err);
			}
			client.query(sql, values, function(err, result) {
				done();
				cb(err, result);
			})
		});
	}
};
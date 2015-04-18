var express = require('express')
	, router = express.Router()
	, log = require('../libs/log')(module)
	, pg = require('pg')
	, SessionModel = require("../libs/mongoose").SessionModel;


router.get('/session/:id', function (req, res) {
	return SessionModel.findById(req.params.id, function (err, session) {
		if (!session) {
			res.statusCode = 404;
			return res.send({error: 'Not found'});
		}
		if (!err) {
			return res.send({status: 'OK', session: session});
		} else {
			res.statusCode = 500;
			log.error('Internal error(%d): %s', res.statusCode, err.message);
			return res.send({error: 'Server error'});
		}
	});
});

router.post('/session', function (req, res) {
	var session = new SessionModel({
		userId: req.body.userId,
		clientTime: req.body.clientTime
	});

	var user = [];

	pg.connect(config.get('postgres:uri'), function(err, client, done) {
		// SQL Query > Select Data
		var query = client.query("SELECT * FROM users WHERE userId = $1", [session.userId]);

		// Stream results back one row at a time
		query.on('row', function(row) {
			user.push(row);
		});

		// After all data is returned, close connection and return results
		query.on('end', function() {
			client.end();
			return res.json(user);
		});

		// Handle Errors
		if(err) {
			log.error(err);
		}

	});

	// TODO check retrieving data and get user premiumи
	var userPremium = true;
	session.premium = userPremium;

	session.save(function (err) {
		if (!err) {
			log.info("session created");
			return res.send({status: 'OK', session: session});
		} else {
			console.log(err);
			if (err.name == 'ValidationError') {
				res.statusCode = 400;
				res.send({error: 'Validation error'});
			} else {
				res.statusCode = 500;
				res.send({error: 'Server error'});
			}
			log.error('Internal error(%d): %s', res.statusCode, err.message);
		}
	});
});

router.put('/session/:id', function (req, res) {
	return SessionModel.findById(req.params.id, function (err, session) {
		if (!session) {
			res.statusCode = 404;
			return res.send({error: 'Not found'});
		}

		session.premium = req.body.premium;
		return session.save(function (err) {
			if (!err) {
				log.info("session updated");
				return res.send({status: 'OK', session: session});
			} else {
				if (err.name == 'ValidationError') {
					res.statusCode = 400;
					res.send({error: 'Validation error'});
				} else {
					res.statusCode = 500;
					res.send({error: 'Server error'});
				}
				log.error('Internal error(%d): %s', res.statusCode, err.message);
			}
		});
	});
});

router.delete('/session/:id', function (req, res) {
	return SessionModel.findById(req.params.id, function (err, session) {
		if (!session) {
			res.statusCode = 404;
			return res.send({error: 'Not found'});
		}

		session.endTime = new Date();
		return session.save(function (err) {
			if (!err) {
				log.info("session updated");
				return res.send({status: 'OK', session: session});
			} else {
				if (err.name == 'ValidationError') {
					res.statusCode = 400;
					res.send({error: 'Validation error'});
				} else {
					res.statusCode = 500;
					res.send({error: 'Server error'});
				}
				log.error('Internal error(%d): %s', res.statusCode, err.message);
			}
		});
	});
});
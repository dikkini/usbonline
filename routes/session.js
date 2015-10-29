var express = require('express')
	, router = express.Router()
	, log = require('../libs/log')(module)
	, pg = require('pg')
	, config = require('../libs/config')
	//, redis = require('redis')
	, crypto = require('crypto');
	//, redisCli = redis.createClient(config.get("redis:port"), config.get("redis:host"));


router.get('/:id', function (req, res) {
	var response = {
		status: 200,
		success: true
	};
	redisCli.get(req.params.id, function (err, reply) {
		if (err) {
			log.error(err);
			response.status = 500;
			response.success = false;
			return res.end(JSON.stringify(response));
		}
		log.debug(reply);
		if (!reply) {
			response.status = 404;
			response.success = false;
			response.errorMessage = "Cant find session for this user";
			return res.end(JSON.stringify(response));
		}
		reply = JSON.parse(reply);
		response.id = reply.id;
		return res.end(JSON.stringify(response));
	});
});

router.post('/', function (req, res) {
	var userId = req.body.userId;
	var userTime = req.body.userTime;
	log.debug(userId + userTime);
	var sessionId = crypto.createHash('md5').update(userId + userTime).digest('hex') + "ceb20772e0c9d240c75eb26b0e37abee"; // TODO change salt
	log.debug(sessionId);
	var session = {
		// TODO more info?
		id: sessionId,
		userId: userId,
		userStartTime: userTime
	};

	var response = {
		status: 200,
		success: true
	};

	pg.connect(config.get('postgres:uri'), function (err, client, done) {
		// Handle Errors
		if (err) {
			log.error(err);
			response.status = 500;
			response.success = false;
			response.errorMessage = "General database exception";
			return res.end(JSON.stringify(response));
		}
		// SQL Query > Select Data
		client.query("SELECT premium FROM users WHERE userId = $1", [userId], function (err, result) {
			if (result.rowCount > 1) {
				// should never happens
				var msg = "There are more than one user with unique name";
				log.error(msg);
				response.status = 500;
				response.success = false;
				response.errorMessage = msg;
				done();
				return res.end(JSON.stringify(response));
			} else if (result.rowCount == 0) {
				// there are no user
				log.debug("There are no user. Creating user with userid: " + userId);
				client.query("INSERT INTO public.users (userId) VALUES ($1);", [userId], function (err, result) {
					if (err) {
						log.error(err);
						response.status = 500;
						response.success = false;
						response.errorMessage = "We cant create user for some reason.";
						done();
						return res.end(JSON.stringify(response));
					}
					log.debug("User created.");
					session.premium = false;
					response.sessionId = session.id;
					redisCli.set(userId, JSON.stringify(session));
					//redisCli.expire(userId, config.get("redis:expire_session"));
					done();
					return res.end(JSON.stringify(response));
				});
			} else {
				log.debug("User found.");
				var row = result.rows[0];
				log.info(result.rows[0]);

				session.premium = row.premium;

				response.status = 200;
				response.sessionId = session.id;

				redisCli.set(userId, JSON.stringify(session));

				done();
				return res.end(JSON.stringify(response));
			}
		});

		pg.end();

	});
});

router.put('/:id', function (req, res) {
	// TODO i think this is will be update session after user bought premium account
});

router.delete('/:id', function (req, res) {
	var userTime = req.body.userTime;
	var userId = req.params.id;
	log.debug(userTime);
	log.debug(userId);
	var response = {
		status: 200,
		success: true
	};

	redisCli.exists(userId, function(err, reply) {
		if (reply === 1) {
			var session = redisCli.get(userId);
			session = JSON.parse(session);
			// TODO make coherence between logs and session
			session.logId = "1";
			session.userEndTime = userTime;
			redisCli.del(userId);

			client.query("INSERT INTO public.sessions (id, log_id, usertimesend, usertimestart) VALUES($1, $2, $3, $4);",
				[session.id, session.logId, session.userEndTime, session.userStartTime], function (err, result) {
					if (err) {
						log.error(err);
						response.status = 500;
						response.success = false;
						response.errorMessage = "We did not save session";
						done();
						return res.end(JSON.stringify(response));
					}
					redisCli.del(userId);
					return res.end(JSON.stringify(response));
			});
		} else {
			log.debug("There are no session for user: " + userId);
			response.status = 404;
			response.success = false;
			response.error = "There are no session for such user.";
			return res.end(JSON.stringify(response));
		}
	});
});


module.exports = router;
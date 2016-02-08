var express = require('express')
	, router = express.Router()
	, log = require('../libs/log')(module)
	, db = require('../service/db')
	, async = require('async')
	, config = require('../libs/config');

router.get('/', function (req, res, next) {
	log.debug("Building index page");
	async.waterfall([
		function (callback) {
			db.query(config.get("sql:social:get_all_active_categories"), [], function (err, result) {
				log.debug(result);
				if (err) {
					res.status(err.status || 500);
					log.error('Internal error(%d): %s',res.statusCode,err.message);
					return res.render('errors/500');
				}
				var categories = result.rows;
				callback(null, categories);
			});
		},
		function (categories, callback) {
			async.forEachOf(categories, function (value, key, callback) {
				db.query(config.get("sql:social:count_category_topics"), [value.id], function (err, result) {
					log.debug(result);
					if (err) {
						log.error(err);
						value.topicsCount = 0;
					} else {
						value.topicsCount = result.rows[0].count;
					}

					db.query(config.get("sql:social:count_category_comments"), [value.id], function (err, result) {
						log.debug(result);
						if (err) {
							log.error(err);
							value.commentsCount = 0;
						} else {
							value.commentsCount = result.rows[0].count;
						}
						callback();
					});
				});
			}, function (err) {
				if (err) console.error(err.message);
				// configs is now a map of JSON data
				callback(null, categories);
			});
		}, function (categories, callback) {
			log.debug("Get recent gratitudes topics");
			db.query(config.get("sql:social:get_recent_gratitudes_topics"), [], function (err, result) {
				var pageData = {};
				log.debug(result);
				if (err) {
					log.error(err);
				}
				pageData.gratitudes = result.rows;
				pageData.categories = categories;

				callback(null, pageData)
			});
		}
	], function(err, result) {
		return res.render('social/index', {pageData:result});
	});
});

router.post('/getRevTopicsByCategory', function (req, res, next) {
	var categoryId = req.body.categoryId;
	log.debug("Get all categories with TOP topics for it");
	db.query(config.get("sql:social:get_top_topics_by_category_id"), [categoryId], function (err, result) {

		log.debug(result);
		if (err) {
			log.error(err);
			res.status(err.status || 500);
			log.error('Internal error(%d): %s',res.statusCode,err.message);
			return res.render('errors/500');
		}
		if (result.rowCount == 0) {
			db.query(config.get("sql:social:get_recent_topics_by_category_id"), [categoryId], function (err, result) {
				log.debug(result);
				if (err) {
					log.error(err);
					res.status(err.status || 500);
					log.error('Internal error(%d): %s',res.statusCode,err.message);
					return res.render('errors/500');
				}
				return res.end(JSON.stringify(result.rows));
			});
		} else {
			return res.end(JSON.stringify(result.rows));
		}
	});
});

router.post('/getTopicsByCategory', function (req, res, next) {
	var categoryId = req.body.categoryId;
	log.debug("Get all topics for category: " + categoryId);
	db.query(config.get("sql:social:get_all_topics_by_category_id"), [categoryId], function (err, result) {

		log.debug(result);
		if (err) {
			log.error(err);
			res.status(err.status || 500);
			log.error('Internal error(%d): %s',res.statusCode,err.message);
			return res.render('errors/500');
		}
		return res.end(JSON.stringify(result.rows));
	});
});

router.get('/category/:id', function (req, res, next) {
	var categoryId = req.params.id;
	log.debug("Building index page");
	async.waterfall([
		function (callback) {
			db.query(config.get("sql:social:get_all_topics_by_category_id"), [categoryId], function (err, result) {
				log.debug(result);
				if (err) {
					res.status(err.status || 500);
					log.error('Internal error(%d): %s',res.statusCode,err.message);
					return res.render('errors/500');
				}
				var topics = result.rows;
				callback(null, topics);
			});
		},
		function (topics, callback) {
			async.forEachOf(topics, function (value, key, callback) {
				db.query(config.get("sql:social:count_topic_comments"), [value.id], function (err, result) {
					log.debug(result);
					if (err) {
						log.error(err);
						value.commentsCount = 0;
					} else {
						value.commentsCount = result.rows[0].count;
					}

					callback();
				});
			}, function (err) {
				if (err) console.error(err.message);
				// data is ready, call callback of waterfall
				callback(null, topics);
			});
		}, function (topics, callback) {
			log.debug("Get recent gratitudes topics");
			db.query(config.get("sql:social:get_recent_gratitudes_topics"), [], function (err, result) {
				log.debug(result);
				if (err) {
					log.error(err);
				}
				var recentGratitudes = result.rows;

				callback(null, topics, recentGratitudes)
			});
		}, function (topics, recentGratitudes, callback) {
			log.debug("Get recent gratitudes topics");
			db.query(config.get("sql:social:get_category_by_id"), [categoryId], function (err, result) {
				var pageData = {};
				log.debug(result);
				if (err) {
					log.error(err);
				}
				pageData.gratitudes = recentGratitudes;
				pageData.topics = topics;
				pageData.category = result.rows[0];

				callback(null, pageData)
			});
		}
	], function(err, result) {
		return res.render('social/category', {pageData:result});
	});
});

router.get('/topic/:topicId', function (req, res, next) {
	var topicId = req.params.topicId;
	log.debug("Building topic page");
	async.waterfall([
		function (callback) {
			db.query(config.get("sql:social:get_topic_by_id"), [topicId], function (err, result) {

				log.debug(result);
				if (err) {
					log.error(err);
					res.status(err.status || 500);
					log.error('Internal error(%d): %s',res.statusCode,err.message);
					return res.render('errors/500');
				}

				var topic = result.rows[0];

				if (!topic) {
					return res.render('errors/404', {error: '404 Oops.. Page not found! Sorry..'});
				}

				callback(null, topic)
			});
		}, function (topic, callback) {
			log.debug("get_all_comments_for_topic_order_by_createddate");
			db.query(config.get("sql:social:get_all_comments_for_topic_order_by_createddate"), [topic.id], function (err, result) {
				log.debug(result);
				if (err) {
					log.error(err);
				}
				var comments = result.rows;

				callback(null, topic, comments)
			});
		}, function (topic, comments, callback) {
			log.debug("Get recent gratitudes topics");
			db.query(config.get("sql:social:get_recent_gratitudes_topics"), [], function (err, result) {
				var pageData = {};
				log.debug(result);
				if (err) {
					log.error(err);
				}
				pageData.topic = topic;
				pageData.comments = comments;
				pageData.gratitudes = result.rows;

				callback(null, pageData)
			});
		}
	], function(err, result) {
		return res.render('social/topic', {pageData:result});
	});
});

router.post('/createTopic', function (req, res, next) {
	var name =  req.body.name;
	var email =  req.body.email;
	var topicText =  req.body.topicText;
	var topicSubject =  req.body.topicSubject;
	var topicCategory =  req.body.topicCategory;

	log.debug("Create user topic... ");
	log.debug("name: " + name);
	log.debug("email: " + email);
	log.debug("topicSubject: " + topicSubject);
	log.debug("topicText: " + topicText);
	log.debug("topicCategory: " + topicCategory);

	var response = {
		success: true
	};
	db.query(config.get("sql:social:create_new_user_topic"), [topicSubject, topicText, name, email, topicCategory], function (err, result) {

		log.debug(result);
		if (err) {
			log.error(err);
			res.status(err.status || 500);
			log.error('Internal error(%d): %s',res.statusCode,err.message);
			response.success = false;
			response.error = "Can't create new topic. Internal database error";
			return res.end(JSON.stringify(response));
		}
		return res.end(JSON.stringify(response));
	});

});

router.post('/topic/addComment', function (req, res, next) {
	var commentText = req.body.commentText;
	var commentName = req.body.commentName;
	var topicId = req.body.topicId;

	var response = {
		success: true
	};

	log.debug("Add comment. Name: " + commentName + " Text: " + commentText + " TopicID: " + topicId);
	db.query(config.get("sql:social:add_new_comment_to_topic"), [topicId, commentName, commentText, new Date()], function (err, result) {

		log.debug(result);
		if (err) {
			log.error(err);
			res.status(err.status || 500);
			log.error('Internal error(%d): %s',res.statusCode,err.message);
			response.success = false;
			response.error = "Can't add comment. Internal database error";
			return res.end(JSON.stringify(response));
		}
		return res.end(JSON.stringify(response));
	});
});

router.get('/:sessionId', function (req, res, next) {
	var sessionId = req.params.sessionId;
	log.debug("Building session topics page");
	async.waterfall([
		function (callback) {
			db.query(config.get("sql:social:get_session_topics"), [sessionId], function (err, result) {

				log.debug(result);
				if (err) {
					log.error(err);
					res.status(err.status || 500);
					log.error('Internal error(%d): %s',res.statusCode,err.message);
					return res.render('errors/500');
				}

				var topics = result.rows;

				callback(null, topics)
			});
		},function (topics, callback) {
			log.debug("Get recent gratitudes topics");
			db.query(config.get("sql:social:get_recent_gratitudes_topics"), [], function (err, result) {
				var pageData = {};
				log.debug(result);
				if (err) {
					log.error(err);
				}
				pageData.topics = topics;
				pageData.gratitudes = result.rows;

				callback(null, pageData)
			});
		}
	], function(err, result) {
		return res.render('social/sessionTopics', {pageData:result});
	});
});

module.exports = router;

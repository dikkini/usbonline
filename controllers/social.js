var express = require('express')
	, router = express.Router()
	, log = require('../libs/log')(module)
	, db = require('../service/db')
	, async = require('async')
	, config = require('../libs/config');

router.get('/', function (req, res, next) {
	log.debug("Get all categories");
	db.query(config.get("sql:social:get_all_active_categories"), [], function (err, result) {
		log.debug(result);
		if (err) {
			log.error("Get all categories error: ", err);
		}
		return res.render('social/index', {categories:result.rows});
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
	log.debug("Get all topics for category id: " + categoryId);
	db.query(config.get("sql:social:get_category_by_id"), [categoryId], function (err, result) {

		log.debug(result);
		if (err) {
			log.error(err);
			res.status(err.status || 500);
			log.error('Internal error(%d): %s',res.statusCode,err.message);
			return res.render('errors/500');
		}
		return res.render('social/category', {category:result.rows[0]});
	});
});

router.get('/topic/:topicId', function (req, res, next) {
	var topicId = req.params.topicId;
	db.query(config.get("sql:social:get_topic_by_id"), [topicId], function (err, result) {

		log.debug(result);
		if (err) {
			log.error(err);
			res.status(err.status || 500);
			log.error('Internal error(%d): %s',res.statusCode,err.message);
			return res.render('errors/500');
		}
		var topic = result.rows[0];
		topic.since = timeSince(topic.createddate);
		return res.render('social/topic', {topic:topic});
	});
});

function timeSince(date) {

	var seconds = Math.floor((new Date() - date) / 1000);

	var interval = Math.floor(seconds / 31536000);

	if (interval > 1) {
		return interval + " years ago";
	}
	interval = Math.floor(seconds / 2592000);
	if (interval > 1) {
		return interval + " months ago";
	}
	interval = Math.floor(seconds / 86400);
	if (interval > 1) {
		return interval + " days ago";
	}
	interval = Math.floor(seconds / 3600);
	if (interval > 1) {
		return interval + " hours ago";
	}
	interval = Math.floor(seconds / 60);
	if (interval > 1) {
		return interval + " minutes ago";
	}
	return Math.floor(seconds) + " seconds ago";
};

module.exports = router;

var express = require('express')
	, router = express.Router()
	, log = require('../libs/log')(module)
	, db = require('../service/db')
	, config = require('../libs/config');

router.get('/', function (req, res, next) {
	log.debug("Get all categories");
	db.query(config.get("sql:social:get_all_categories"), [], function (err, result) {

		log.debug(result);
		if (err) {
			log.error("Get all categories error: ", err);
		}
		return res.render('social/index', {categories:result.rows});
	});
});

router.get('/category/:id', function (req, res, next) {
	var categoryId = req.params.id;
	log.debug("Get all topics for category id: " + categoryId);
	db.query(config.get("sql:social:get_all_topics_by_category_id"), [categoryId], function (err, result) {

		log.debug(result);
		if (err) {
			log.error("Get all topics error: ", err);
		}
		return res.render('social/category', {topics:result.rows});
	});
});

router.get('/category/:categoryId/topic/:topicId', function (req, res, next) {
	var categoryId = req.params.categoryId;
	var topicId = req.params.topicId;
	res.render('social/topic');
});

module.exports = router;

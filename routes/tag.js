const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');

router.route('/')
  .get(tagController.allTags)

router
  .route('/create')
  .post(
    tagController.create,
  );


module.exports = router;

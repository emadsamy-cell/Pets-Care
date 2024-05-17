const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authController = require('../controllers/authController');

router.route('/')
  .post(commentController.allComments);

router
  .route('/create')
  .post(
    authController.protect,
    commentController.create,
  );

router
  .route('/update')
  .patch(
    authController.protect,
    commentController.auth,
    commentController.update,
  );

router
  .route('/delete')
  .delete(
    authController.protect,
    commentController.auth,
    commentController.delete,
  );

router
  .route('/upvote')
  .patch(
    authController.protect,
    commentController.upvote
  );

router
  .route('/downvote')
  .patch(
    authController.protect,
    commentController.downvote
  );

router
  .route('/resetvote')
  .patch(
    authController.protect,
    commentController.resetvote
  );


module.exports = router;

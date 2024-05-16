const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authController = require('../controllers/authController');

router.route('/')
  .get(postController.allPosts)
  .post(postController.onePost);


router.route('/pages')
  .get(postController.pages);

router
  .route('/create')
  .post(
    authController.protect,
    postController.uploadPostPhoto,
    postController.create,
  );

router
  .route('/update')
  .patch(
    authController.protect,
    postController.uploadPostPhoto,
    postController.auth,
    postController.update,
  );

router
  .route('/delete')
  .delete(
    authController.protect,
    postController.auth,
    postController.delete,
  );

router
  .route('/upvote')
  .patch(
    authController.protect,
    postController.upvote
  );

router
  .route('/downvote')
  .patch(
    authController.protect,
    postController.downvote
  );

router
  .route('/resetvote')
  .patch(
    authController.protect,
    postController.resetvote
  );


module.exports = router;

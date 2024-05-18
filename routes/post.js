const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authController = require('../controllers/authController');

router.route('/')
  .get(postController.allPosts)
  .post(postController.onePost);


router.route('/pages')
  .get(postController.pages);

router.use(authController.protect);

router
  .route('/myPosts')
  .get(postController.myPosts);

router
  .route('/bookmarks')
  .get(postController.getBookmarks)
  .post(postController.addBookmark)
  .delete(postController.removeBookmark);

router
  .route('/create')
  .post(
    postController.uploadPostPhoto,
    postController.create,
  );

router
  .route('/update')
  .patch(
    postController.uploadPostPhoto,
    postController.auth,
    postController.update,
  );

router
  .route('/delete')
  .delete(
    postController.auth,
    postController.delete,
  );

router
  .route('/upvote')
  .patch(
    postController.upvote
  );

router
  .route('/downvote')
  .patch(
    postController.downvote
  );

router
  .route('/resetvote')
  .patch(
    postController.resetvote
  );


module.exports = router;

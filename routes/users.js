const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

router.patch('/forgetPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.post('/signup', authController.signUp);
router.post('/signin', authController.signIn);
router.use(authController.protect);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  //userController.resizeUserPhoto,
  userController.updateMe,
);
router
  .route('/:id')
  .get(userController.getUser)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;

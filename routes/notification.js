const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authController = require('../controllers/authController');

router.use(authController.protect);
router
  .route('/')
  .patch(notificationController.readNotification)
  .delete(notificationController.deleteNotification);
router.route('/:id').get(notificationController.getNotificationForOneUser);

module.exports = router;

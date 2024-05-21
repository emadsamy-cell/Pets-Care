const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const historyController = require('../controllers/historyController');

router.use(authController.protect);
router
  .route('/')
  .post(historyController.addHistory)
  .get(historyController.getHistoryForAuthenticatedUser);
router.route('/user/:userId').get(historyController.getHistoryForUser);
router
  .route('/appoinment/:appoinmentId')
  .get(historyController.getHistoryForAppoinment);

module.exports = router;

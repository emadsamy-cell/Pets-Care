const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const historyController = require('../controllers/historyController');

router.use(authController.protect);
router.route('/').post(historyController.createHistory);
router.route('/:userId').get(historyController.getHistory);
module.exports = router;

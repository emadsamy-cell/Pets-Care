const express = require('express');
const router = express.Router();
const petyController = require('../controllers/petyController');
const authController = require('../controllers/authController');

const reviewRouter = require('./reviews');

router.use('/:petyId/reviews', reviewRouter);

router.route('/pages').get(petyController.pages);

router
  .route('/appointment')
  .post(
    authController.protect,
    authController.petyAvailability,
    petyController.appointment,
  );

router
  .route('/')
  .get(petyController.getAllPety)
  .post(
    authController.protect,
    authController.petySignUp,
    petyController.becomePety,
  );

router.route('/details').post(petyController.petyDetail);
router
  .route('/:petyId/appointment/:appointmentId')
  .patch(authController.protect, petyController.appointmentStatus);

module.exports = router;

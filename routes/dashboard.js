const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const dashboardController = require('../controllers/dashboardController');

router.use(authController.protect);

router
  .route('/allRoles')
  .get(
    dashboardController.allRoles 
  );

router
  .route('/workingHours')
  .post(
    authController.petyRole,dashboardController.workingHours 
  );

router
  .route('/petyInformation')
  .post(
    authController.petyRole,dashboardController.petyInformation 
  );

router
  .route('/allAppointments')
  .post(
    authController.petyRole,dashboardController.allAppointments 
  );

router
  .route('/changeAppointment')
  .patch(
    dashboardController.changeAppointment
  );

router
  .route('/updatePety')
  .patch(
    dashboardController.uploadUserPhoto,
    dashboardController.updatePety
  );


router
  .route('/timeTable')
  .post(
    authController.petyRole, 
    dashboardController.timeTable,
  );

  module.exports = router;
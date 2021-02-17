const express = require('express');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router
  .route('/checkout-sessions/:tourId')
  .get(authController.protect, bookingController.getCheckoutSession);

router.route('/').get(authController.protect, bookingController.getAllBookings);

module.exports = router;

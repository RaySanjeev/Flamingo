const express = require('express');

const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/').get(authController.isLoggedIn, viewController.renderHomePage);
router
  .route('/login')
  .post(
    authController.isLoggedIn,
    authController.login,
    viewController.renderHomePage
  );

router.route('/me').get(authController.protect, viewController.renderAccount);

router
  .route('/logout')
  .get(authController.logout, viewController.renderHomePage);

router
  .route('/signup')
  .post(authController.signUp, viewController.renderHomePage);

router
  .route('/tours')
  .get(authController.isLoggedIn, viewController.renderTours);

router
  .route('/tours/:slug')
  .get(authController.isLoggedIn, viewController.renderTourPage);
module.exports = router;

const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const viewController = require('../controllers/viewController');

const router = express.Router();

router.route('/signup').post(authController.signUp);
router.route('/login').post(authController.login);
router.route('/logout').get(authController.logout);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

// PROTECT ALL USERS AFTER THIS MIDDLEWARE
router.use(authController.protect);

router
  .route('/updatePassword')
  .post(authController.updatePassword, viewController.redirectAccount);
router
  .route('/updateMe')
  .post(
    userController.uploadUserPhoto,
    userController.imageProcessingUser,
    userController.updateMe
  );
router.route('/deleteMe').delete(userController.deleteMe);
router.route('/me').get(userController.getMe, userController.getUser);

// RESTRICT ALL ROUTES AFTER THIS MIDDLEWARE
// router.use(authController.restrictTo('admin'));

router.route('/').get(userController.getAllUsers);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;

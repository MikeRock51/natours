const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(
    authController.authenticate,
    authController.restrictTo('admin'),
    userController.getAllUsers
  )
  .post(userController.createUser);

router
  .route('/me')
  .patch(authController.authenticate, userController.updateUser)
  .delete(authController.authenticate, userController.deleteMe);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(
    authController.authenticate,
    authController.restrictTo('admin'),
    userController.deleteUser
  );

module.exports = router;

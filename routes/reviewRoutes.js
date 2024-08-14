const express = require('express');
const { authenticate, restrictTo } = require('../controllers/authController');
const {
  getAllReviews,
  createReview
} = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(authenticate, getAllReviews)
  .post(authenticate, restrictTo('user'), createReview);

module.exports = router;

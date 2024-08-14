const express = require('express');
const { authenticate, restrictTo } = require('../controllers/authController');
const {
  getAllReviews,
  createReview,
  deleteReview
} = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(authenticate, getAllReviews)
  .post(authenticate, restrictTo('user'), createReview);

router.route('/:id').delete(authenticate, deleteReview);

module.exports = router;

const express = require('express');
const { authenticate, restrictTo } = require('../controllers/authController');
const {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview
} = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(authenticate, getAllReviews)
  .post(authenticate, restrictTo('user'), createReview);

router
  .route('/:id')
  .patch(authenticate, updateReview)
  .delete(authenticate, deleteReview);

module.exports = router;

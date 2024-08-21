const express = require('express');
const { authenticate, restrictTo } = require('../controllers/authController');
const {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourBody,
  getReview
} = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router.use(authenticate);

router
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), setTourBody, createReview);

router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .delete(restrictTo('user', 'admin'), deleteReview);

module.exports = router;

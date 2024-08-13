const express = require('express');
const { authenticate, restrictTo } = require('../controllers/authController');
const {
  getAllReviews,
  createReview
} = require('../controllers/reviewController');

const router = express.Router();

router.get('/', authenticate, restrictTo('admin'), getAllReviews);
router.post('/', authenticate, createReview);

module.exports = router;

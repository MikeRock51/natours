const ReviewModel = require('../models/reviewModel');
const { catchAsync } = require('../utils/errors/errorHandler');

module.exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await ReviewModel.find({});

  res.status(200).json({
    status: 'success',
    message: 'Reviews fetched successfully!',
    data: { reviews }
  });
});

module.exports.createReview = catchAsync(async (req, res, next) => {
  await ReviewModel.create({ ...req.body, user: req.currentUser._id });

  res.status(201).json({
    status: 'success',
    message: 'Review created successfully!'
  });
});

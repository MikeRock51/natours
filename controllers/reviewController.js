const ReviewModel = require('../models/reviewModel');
const { catchAsync } = require('../utils/errors/errorHandler');
const factory = require('./factoryFunctions');

module.exports.getAllReviews = catchAsync(async (req, res, next) => {
  const filter = {};

  if (req.params.tourId) filter.tour = req.params.tourId;
  const reviews = await ReviewModel.find(filter);

  res.status(200).json({
    status: 'success',
    message: 'Reviews fetched successfully!',
    data: { reviews }
  });
});

module.exports.createReview = catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.currentUser._id;

  await ReviewModel.create(req.body);

  res.status(201).json({
    status: 'success',
    message: 'Review created successfully!'
  });
});

module.exports.deleteReview = factory.deleteOne(ReviewModel);

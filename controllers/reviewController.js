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

module.exports.setTourBody = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.currentUser._id;

  next();
};

module.exports.createReview = factory.createOne(ReviewModel);
module.exports.updateReview = factory.updateOne(ReviewModel);
module.exports.deleteReview = factory.deleteOne(ReviewModel);

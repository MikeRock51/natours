// const fs = require('fs');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/errors/AppErrors');

exports.getAllTours = AppError.catchAsync(async (req, res, next) => {
  const query = Tour.find();
  const features = new APIFeatures(query, req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.dbQuery;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
});

exports.getTour = AppError.catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const tour = await Tour.findById(id);

  if (!tour) return next(new AppError('No tour found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.createTour = AppError.catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
});

exports.updateTour = AppError.catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const tour = await Tour.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.deleteTour = AppError.catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const tour = await Tour.findByIdAndDelete(id);

  if (!tour) return next(new AppError('No tour found with that ID', 404));
  
  res.status(204).json({
    status: 'success'
  });
});

exports.getStats = AppError.catchAsync(async (req, res, next) => {
  const { group = 'difficulty' } = req.query;
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: `$${group}` },
        numTours: { $sum: 1 },

        minPrice: { $min: '$price' },
        avgPrice: { $avg: '$price' },
        maxPrice: { $max: '$price' },

        minRating: { $min: '$ratingsAverage' },
        avgRating: { $avg: '$ratingsAverage' },
        maxRating: { $max: '$ratingsAverage' }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    stats
  });
});

exports.getMonthlyPlan = AppError.catchAsync(async (req, res, next) => {
  const { year } = req.params;

  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: {
          $push: {
            name: '$name',
            startDate: '$startDates',
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        month: '$_id',
        numTours: 1,
        tours: 1,
      }
    },
    { $sort: { numTours: -1 } }
  ]);

  res.status(200).json({
    status: 'success',
    plan
  });
});

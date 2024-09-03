const Tour = require('../models/tourModel');
const { catchAsync } = require('../utils/errors/errorHandler');
const factory = require('./factoryFunctions');
const AppError = require('../utils/errors/AppErrors');
// const APIFeatures = require('../utils/apiFeatures');
// const fs = require('fs');

exports.getTour = factory.getOne(Tour, { populate: { path: 'reviews' } });
exports.getAllTours = factory.getAll(Tour);
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  // /tours-within/:distance/center/:latlng/unit/:unit

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in this format: latitutde,longitude',
        400
      )
    );
  }

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    message: 'Tours retrieved successfully!',
    results: tours.length,
    data: {
      tours
    }
  });
});

exports.getTourDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in this format: latitutde,longitude',
        400
      )
    );
  }

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  const tours = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [+lng, +lat]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        name: 1,
        distance: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    message: 'Tours distances retrieved successfully!',
    data: {
      tours
    }
  });
});

exports.getStats = catchAsync(async (req, res, next) => {
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

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
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
            startDate: '$startDates'
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        month: '$_id',
        numTours: 1,
        tours: 1
      }
    },
    { $sort: { numTours: -1 } }
  ]);

  res.status(200).json({
    status: 'success',
    plan
  });
});

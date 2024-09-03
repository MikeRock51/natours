const express = require('express');
const tourController = require('./../controllers/tourController');
const { authenticate, restrictTo } = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// router.param('id', tourController.checkID);

router.use('/:tourId/reviews', reviewRouter);
router.route('/stats').get(tourController.getStats);
router
  .route('/monthly-plan/:year')
  .get(
    authenticate,
    restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router
  .route('/distance/:latlng/unit/:unit')
  .get(tourController.getTourDistances);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authenticate,
    restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authenticate,
    restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authenticate,
    restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;

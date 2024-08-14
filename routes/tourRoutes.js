const express = require('express');
const tourController = require('./../controllers/tourController');
const { authenticate, restrictTo } = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// router.param('id', tourController.checkID);

router.use('/:tourId/reviews', reviewRouter);

router.route('/stats').get(authenticate, tourController.getStats);
router
  .route('/monthly-plan/:year')
  .get(authenticate, tourController.getMonthlyPlan);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authenticate,
    restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;

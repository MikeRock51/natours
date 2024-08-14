const { catchAsync } = require('../utils/errors/errorHandler');
const AppError = require('../utils/errors/AppErrors');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const doc = await Model.findByIdAndDelete(id);

    if (!doc) return next(new AppError('No document found with that ID', 404));

    res.status(204).json({
      status: 'success'
    });
  });

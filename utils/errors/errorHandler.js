const AppError = require('./AppErrors');

function catchAsync(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch(err => {
      console.log(err);
      next(err);
    });
  };
}

function handleNonAppErrors(err) {
  if (err.name === 'CastError') {
    return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }
  if (err.code === 11000) {
    return new AppError(
      `Duplicate field value: ${err.keyValue.name}. Please use another value!`,
      400
    );
  }
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(el => el.message);
    return new AppError(`Invalid input data: ${errors.join('. ')}`, 400);
  }
  if (err.name === 'JsonWebTokenError')
    return new AppError('Invalid token. Please log in again!', 401);
  if (err.name === 'TokenExpiredError')
    return new AppError('This token has expired. Please log in again!', 401);

  return err;
}

function sendError(err, res) {
  // console.log(err);
  if (process.env.NODE_ENV === 'production') {
    res.status(err.statusCode || 500).json({
      status: err.status || 'error',
      message: err.isOperational
        ? err.message
        : 'Something went really wrong! 😥'
    });
  } else {
    res.status(err.statusCode || 500).json({
      status: err.status || 'error',
      message: err.message,
      stack: err.stack,
      error: err
    });
  }
}

function globalErrorHandler(err, req, res, next) {
  let error = { ...err };
  if (!error.isOperational) error = handleNonAppErrors(err);
  if (!error.message) error.message = err.message;
  sendError(error, res);
}

module.exports = {
  handleNonAppErrors,
  sendError,
  globalErrorHandler,
  catchAsync
};

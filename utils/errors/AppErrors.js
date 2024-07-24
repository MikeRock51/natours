const { handleDBErrors, sendError } = require('./errorHandler');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode || 500;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static globalErrorHandler(err, req, res, next) {
    let error = { ...err };
    if (!error.isOperational) error = handleDBErrors(err);
    error.message = err.message;
    sendError(error, res);
  }

  static catchAsync(fn) {
    return (req, res, next) => {
      fn(req, res, next).catch(err => {
        console.log(err);
        next(err);
      });
    };
  }
}

module.exports = AppError;

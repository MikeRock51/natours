class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode || 500;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor)
    }

    static globalErrorHandler(err, req, res, next) {
        let error = { ...err };
        console.log(err);
        if (!error.isOperational) error = handleDBErrors(err);
        sendError(error, res);
    }

    static catchAsync = (fn) => {
        return (req, res, next) => {
            fn(req, res, next).catch(err => {
                console.log(err);
                next(err)
            });
        }
    }
}

function handleDBErrors(err) {
    if (err.name === "CastError") {
        return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
    } else if (err.code === 11000) {
        return new AppError(`Duplicate field value: ${err.keyValue.name}. Please use another value!`, 400);
    } else if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map(el => el.message);
        return new AppError(`Invalid input data: ${errors.join('. ')}`, 400);
    } else {
        return err;
    }
}

function sendError(err, res) {
    if (process.env.NODE_ENV === 'production') {
        res.status(err.statusCode || 500).json({
            status: err.status || 'error',
            message: err.isOperational ? err.message : 'Something went really wrong! 😥',
        });
    } else {
        res.status(err.statusCode || 500).json({
            status: err.status || 'error',
            message: err.message,
            stack: err.stack,
            error: err,
        });
    }
}

module.exports = AppError;
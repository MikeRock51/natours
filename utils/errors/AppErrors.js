class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode || 500;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor)
    }

    static globalErrorHandler(err, req, res, next) {
        console.error(err);
        sendError(err, res);
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
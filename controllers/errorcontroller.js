const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldDB = (err) => {
  const message = `Duplicate field value: ${err.keyValue.name}. Please use another value! `;
  return new AppError(message, 400);
};

const handleValidationErrorDb = (err) => {
  return new AppError(err.message, 400);
};

const handleJWTError = () => {
  return new AppError('Invalid token. Please login again', 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      messsage: err.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Something Went very Wrong !!!!',
    });
  }
};

// GLOBAL ERROR HANDLER--- SENDING ERROR RESPONSES
const errorHandler = (err, req, res, next) => {
  console.log(err);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') sendErrorDev(err, res);
  if (process.env.NODE_ENV === 'production') {
    let error;
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDb(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    sendErrorProd(error, res);
  }
};

module.exports = errorHandler;

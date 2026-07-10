export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Resource not found';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    // message = Object.values(err.errors)
    //   .map((val) => val.message)
    //   .join(', ');
  }

  console.error('❌ Error:', {
    message: err.message,
    stack: err.stack,
  });

  return res.status(statusCode).json({
    statusCode,
    success: false,
    message,
    errors,
    data: null,
  });
};

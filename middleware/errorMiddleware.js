// middleware/errorMiddleware.js
// Purpose: Centralized error handling. Instead of writing try/catch +
// res.status().json() in every controller, controllers just call
// next(error) and this middleware formats the final response.

// Handles requests to routes that don't exist (404).
const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error); // passes control to errorHandler below
};

// Express recognizes this as an error handler because it takes 4 arguments.
// It MUST be registered last, after all routes, in server.js.
const errorHandler = (err, req, res, next) => {
  // Sometimes an error is thrown with a 200 status by mistake; default to 500.
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Mongoose "CastError" happens when an invalid ObjectId is passed (e.g. /expenses/123)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found (invalid ID format)';
  }

  // Mongoose validation errors (e.g. missing required field)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Duplicate key error (e.g. registering with an email that already exists)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue).join(', ');
    message = `Duplicate value for field: ${field}`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Only expose stack trace in development, never in production
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };

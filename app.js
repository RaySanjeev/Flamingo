const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
// const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const tourRouter = require('./routes/tourRoutes');
const viewRouter = require('./routes/viewRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const AppError = require('./utils/appError');
const errorHandler = require('./controllers/errorcontroller');

const app = express();

// SETTING PUG
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// SERVING STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));

// GLOBAL MIDDLEWARES
// app.use(helmet());

// Rate limiter
const limiter = rateLimit({
  max: 300,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP. Please try again after an hour.',
});
app.use('/api', limiter);

// Adding incoming request data to the req.body
app.use(express.json({ limit: '10kb' })); // JSON Parser
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // Form parser
app.use(cookieParser()); // Cookie Parser

// Data sanitisation against NoSQL query injection
app.use(mongoSanitize());

// Data sanitisation against xss
app.use(xss());

// Prevent paramater pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'price',
      'ratingsQuantity',
      'ratinsAverage',
      'maxGroupSize',
      'difficulty',
    ],
  })
);

// Logging input request
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ROUTES

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(errorHandler); // GLOBAL ERROR HANDLER MIDDLEWARE

module.exports = app;

const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking')
    res.locals.alert =
      "Your booking was successful! Please check your email for a confirmation. If your booking doesn't show up here immediatly, please come back later.";
  next();
};

exports.renderHomePage = catchAsync(async (req, res, next) => {
  let user;
  if (req.user) {
    user = req.user;
  } else {
    if (res.locals) user = res.locals.user;
  }

  const tours = await Tour.find()
    .sort({ ratingsAverage: -1, ratingsQuantity: -1 })
    .limit(3);
  console.log(tours);
  res.status(200).render('home', {
    title: 'Overview',
    user,
    tours,
  });
});

exports.renderAccount = (req, res, next) => {
  res.status(200).render('account', {
    title: 'ME',
    user: req.user,
  });
};

exports.redirectAccount = (req, res, next) => {
  res.status(200).redirect('/me');
};

exports.renderTours = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render('tours', {
    title: 'TOURS',
    tours,
  });
});

exports.renderTourPage = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }
  res.status(200).render('tourPage', {
    title: tour.slug,
    tour,
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('tours', {
    title: 'My Tours',
    tours,
  });
});

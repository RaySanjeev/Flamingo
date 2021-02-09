const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');
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

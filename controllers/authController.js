const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res, next) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // secure: true, // Send cookie only in https connection
    httpOnly: true, // Browser cannot modify the cookie
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };

  // Send Cookie
  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;
  next();
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();

  req.user = newUser;
  createSendToken(newUser, 201, res, next);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // CHECK IF EMAIL AND PASSWORD IS WRITTEN
  if (!email || !password) {
    return next(new AppError('Please provide your email and password', 401));
  }
  // FIND USER BASED ON EMAIL PROVIDED
  const user = await User.findOne({ email }).select('+password');

  // CHECK FOR USER AND WRONG PASSWORD
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Please provide a valid email or password', 401));
  }
  // GENERATING AND SENDING TOKEN
  req.user = user;
  createSendToken(user, 200, res, next);
});

exports.logout = (req, res, next) => {
  res.cookie('jwt', 'Logged Out', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
  });

  next();
};

exports.protect = catchAsync(async (req, res, next) => {
  // GETTING TOKEN AND CHECK IF ITS THERE
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to get access', 401)
    );
  }
  // VERIFY TOKEN
  const payload = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // CHECK IF USER STILL EXIST
  const currentUser = await User.findById(payload.id);
  if (!currentUser) {
    return next(
      new AppError(
        ' The user belonging to the token does not exist anymore. Please sign up agian.'
      )
    );
  }
  // CHECK IF USER CHANGED THE PASSWORD AFTER THE TOKEN WAS ISSUED
  if (currentUser.changedPasswordAfter(payload.iat)) {
    return next(
      new AppError('User recently changed password. Please login again', 401)
    );
  }
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // VERIFY TOKEN
      const payload = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // CHECK IF USER STILL EXIST
      const currentUser = await User.findById(payload.id);
      if (!currentUser) return next();

      // CHECK IF USER CHANGED THE PASSWORD AFTER THE TOKEN WAS ISSUED
      if (currentUser.changedPasswordAfter(payload.iat)) return next();

      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }

  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // GET THE USER WITH THE EMAIL
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email', 404));
  }

  // GENERATE RANDOM TOKEN
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // SEND THE TOKEN TO THE EMAIL
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to the email.',
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was error sending this email.PLease try again later',
        500
      )
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // GET USER BASED ON TOKEN
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // IF TOKEN HAS NOT EXPIRED AND THERE IS USER, SET THE NEW PASSWORD
  if (!user) {
    return next(new AppError('The token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // UPDATE THE changedPasswordAt PROPERTY

  // LOG THE USER IN, SEND THE JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // GET THE USER
  const user = await User.findById(req.user._id).select('+password');

  // CHECK THE GIVEN CURRENT PASSWORD
  if (!req.body.currentPassword || !req.body.password)
    return next(
      new AppError(
        'PLease enter the previous password and the new password',
        400
      )
    );

  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(
      new AppError(
        'Current password does not matches the previous password',
        401
      )
    );
  }
  // UPDATE PASSWORD
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // LOG THE USER IN
  createSendToken(user, 201, res, next);
});

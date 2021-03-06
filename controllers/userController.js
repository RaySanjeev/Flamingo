const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const factory = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });

const updateImageName = async (req) => {
  await fs.readdir('./public/img/users', (err, imagesArray) => {
    if (err) console.log('File not found');
    else {
      const el = imagesArray.find(
        (el) => String(el.split('-')[1]) === String(req.user._id)
      );
      if (el) {
        fs.unlink(`./public/img/users/${el}`, function (err) {
          if (err) console.log(err);
          console.log('File deleted');
        });
      }
    }
  });
};

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.imageProcessingUser = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  await updateImageName(req);
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filter = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // CREATE ERROR IF USER POST PASSWORD DATA
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'Please use /updatePassword route to update your password',
        400
      )
    );

  // FILTER req.body FROM THE UNWANTED FIELDS
  const filteredObj = filter(req.body, 'name', 'email');
  if (filteredObj.email === '') filteredObj.email = req.user.email;
  if (filteredObj.name === '') filteredObj.name = req.user.name;
  if (req.file) filteredObj.photo = req.file.filename;
  // UPDATE USER DOCUMENT
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredObj, {
    new: true,
    runValidators: true,
  });

  res.redirect('/me');
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: 'succces',
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;

  next();
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.updateUser = factory.updateOne(User);

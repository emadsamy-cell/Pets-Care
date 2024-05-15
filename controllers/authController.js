const User = require('../models/User');
const Pety = require('../models/Pety');
const Appointment = require('../models/appointment');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const crypto = require('crypto');
const multer = require('multer');
const moment = require('moment-timezone');
const timeZone = 'Africa/Cairo';
const multerStorage = multer.diskStorage({});
const upload = multer({ storage: multerStorage });

const { promisify } = require('util');
const { log } = require('console');
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (data, statusCode, res) => {
  const token = createToken(data._id);
  res.status(statusCode).json({
    status: 'success',
    token,
    data,
  });
};

//catchAsync to remove try..catch block from the code we catch the error in it
const signIn = catchAsync(async (req, res, next) => {
  //1)check if the email and password exists
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError('Please provide email and password', 400));
  //2)check if the email and password are correct
  const user = await User.findOne({ email }).select('-__v');
  if (!user || !(await user.correctPasswords(password, user.password))) {
    return next(new AppError('Incorrect email or password !', 401));
  }
  //3)Sign In and send token
  createSendToken(user, 200, res);
});

const signUp = catchAsync(async (req, res, next) => {
  //1)create new user
  let user = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    phone: req.body.phone,
  });

  //4)Sign up and send token
  createSendToken(user, 201, res);
});
const protect = catchAsync(async (req, res, next) => {
  let token;
  //1)check if there is token in the header  ad get the token if there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token)
    return next(
      new AppError("You're not logged in! Please log in to get access ", 401),
    );

  //2)verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //console.log(decoded);
  const currenUser = await User.findById(decoded.id);
  if (!currenUser)
    return next(
      new AppError(
        'The user belonging to this token does no longer exist',
        401,
      ),
    );
  //3)put entire user data in the request
  req.user = currenUser;
  next();
});
const forgetPassword = catchAsync(async (req, res, next) => {
  //1)check if the email is provided
  if (!req.body.email)
    return next(new AppError('Please provide your email address', 404));

  //2)check if the email is actually exist
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(
      new AppError(
        "This email doesn't exist! Please provide correct email address",
        404,
      ),
    );
  //2)Generate the random  reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //send verfication mail with random token
  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/users/resetPassword/${resetToken}`;
  const message = `Forget your password? Submit a PATCH request with your new password and password confirm to:\n ${resetURL} \n if you didn't forget your password, please ignore this email!`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token  (valid for 30 min)',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token send to email!',
    });
  } catch {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'there was an error sending the email. Try again later!',
        500,
      ),
    );
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() },
  });

  //2)If token has not expired,and there is user,set the new password
  if (!user) return next(new AppError('Token is invalid or has expired', 400));
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpire = undefined;
  user.passwordResetToken = undefined;
  await user.save();
  //3)Log the user in, send JWT
  createSendToken(user, 200, res);
});

const petySignUp = catchAsync(async (req, res, next) => {
  pety = await Pety.find({ userId: req.user.id, role: req.body.role });
  if (pety.length) {
    return next(
      new AppError("You can't assign to the same service more than once!", 500),
    );
  }

  // 2) check if the same (role, phonenumber) already in the database
  pety = await Pety.find({
    phoneNumber: req.body.phoneNumber,
    role: req.body.role,
  });
  if (pety.length) {
    return next(new AppError('This phone number already in use!', 500));
  }

  next();
});

const petyRole = catchAsync(async (req, res, next) => {
  const role = req.body.role;
  const userID = req.user.id;

  const pety = await Pety.find({ userId: userID, role: role });
  if (!pety.length) {
    return next(
      new AppError(`you need to become ${role} first to proceed`, 401),
    );
  }

  next();
});

const petyAvailability = catchAsync(async (req, res, next) => {
  const { petyID, date, time } = req.body;
  const appointmentDateTime = moment.tz(
    `${date} ${time}`,
    'DD-MM-YYYY HH:mm A',
    timeZone,
  );
  const result = await Appointment.find({
    petyID: petyID,
    appointmentDateTime: appointmentDateTime.toDate(),
  });

  const timeNow = moment.tz(timeZone);

  if (result.length || appointmentDateTime.toDate() < timeNow.toDate()) {
    return next(
      new AppError(
        "This appointment isn't available at the moment, plase select another appointment!",
        401,
      ),
    );
  }

  next();
});

module.exports = {
  signIn,
  signUp,
  protect,
  forgetPassword,
  resetPassword,
  petySignUp,
  petyRole,
  petyAvailability,
};

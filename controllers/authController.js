const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const AppError = require('../utils/errors/AppErrors');
const { catchAsync } = require('../utils/errors/errorHandler');
const sendEmail = require('../utils/email');

const signToken = userId => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_TTL
  });
};

const createAndSendToken = (
  user,
  statusCode,
  message,
  res,
  returnUser = true
) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    status: 'success',
    message,
    token,
    data: returnUser
      ? {
          user
        }
      : undefined
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await UserModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  createAndSendToken(newUser, 201, 'User created successfully!', res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('Please provide your email and password!', 400));

  const user = await UserModel.findOne({ email }).select('+password');

  if (!user || !(await user.validatePassword(password, user.password)))
    return next(new AppError('Incorrect email or password...', 401));

  createAndSendToken(user, 200, 'Login successful!', res);
});

exports.authenticate = catchAsync(async (req, res, next) => {
  const { authorization } = req.headers;
  const token =
    authorization && authorization.startsWith('Bearer')
      ? authorization.split(' ')[1]
      : null;

  if (!token)
    return next(
      new AppError('You must be logged in to access this route!', 401)
    );

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const user = await UserModel.findById(decoded.id);
  if (!user) return next(new AppError('User no longer exists...', 401));

  if (user.changedPasswordAfter(decoded.iat))
    return next(
      new AppError('Password was recently changed. Please log in again!', 401)
    );

  req.currentUser = user;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.currentUser.role))
      return next(
        new AppError('You are not authorized to perform this action...', 403)
      );

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new AppError('Please provide your email!', 400));

  const user = await UserModel.findOne({ email });
  if (!user) return next(new AppError('User does not exist!', 404));

  try {
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/reset-password/${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: 'Password reset token (valid for only 10 minutes)',
      message: `Click on the link below to reset your password:\n${resetUrl}`
    });

    res.status(200).json({
      status: 'success',
      messsage: 'Password reset token has been sent to your email...',
      resetUrl
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password, passwordConfirm } = req.body;

  if (!password || !passwordConfirm)
    return next(
      new AppError('Please provide new password and passwordConfirm...', 400)
    );

  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await UserModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() }
  });

  if (!user)
    return next(new AppError('Token is invalid or has expired...', 400));

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  createAndSendToken(user, 200, 'Password reset successful!', res, false);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, passwordConfirm } = req.body;

  if (!currentPassword || !newPassword || !passwordConfirm)
    return next(
      new AppError(
        'Please provide your current password, new password and passwordConfirm...',
        400
      )
    );

  const user = await UserModel.findById(req.currentUser._id).select(
    '+password'
  );

  if (!(await user.validatePassword(currentPassword, user.password))) {
    return next(new AppError('Incorrect current password...', 401));
  }

  user.password = newPassword;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  createAndSendToken(user, 200, 'Password reset successful!', res, false);
});

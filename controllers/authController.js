const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const AppError = require('../utils/errors/AppErrors');
const { catchAsync } = require('../utils/errors/errorHandler');

const signToken = userId => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_TTL
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await UserModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirmed: req.body.passwordConfirmed
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    message: 'User created successfully!',
    data: {
      token,
      user: newUser
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('Please provide your email and password!', 400));

  const user = await UserModel.findOne({ email }).select('+password');

  if (!user || !(await user.validatePassword(password, user.password)))
    return next(new AppError('Incorrect email or password...', 401));

  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    message: 'Login successful!',
    token
  });
});

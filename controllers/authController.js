const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const AppError = require('../utils/errors/AppErrors');

exports.signup = AppError.catchAsync(async (req, res, next) => {
  const newUser = await UserModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirmed: req.body.passwordConfirmed
  });

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_TTL
  });

  res.status(201).json({
    status: 'success',
    message: 'User created successfully!',
    data: {
      token,
      user: newUser
    }
  });
});

exports.login = AppError.catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('Please provide your email and password!', 400));

  const user = await UserModel.findOne({ email }).select('+password');

  if (!user) return next(new AppError('Incorrect email or password...', 401));
  console.log(user);

  res.status(200).json({
    status: 'success',
    message: 'Login successful!'
  });
});

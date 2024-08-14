const UserModel = require('../models/userModel');
const { userFields } = require('../utils/constants');
const { catchAsync } = require('../utils/errors/errorHandler');
const { filterObject } = require('../utils/helpers');
const factory = require('./factoryFunctions');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await UserModel.find();

  res.status(200).json({
    status: 'success',
    message: 'Users fetched successfully!',
    data: {
      users
    }
  });
});
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.updateUser = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return res.status(400).json({
      status: 'error',
      message:
        'This route is not for password updates. Please use /update-password instead.'
    });
  }

  // console.log(req.currentUser);

  const filteredBody = filterObject(req.body, userFields);

  await UserModel.findOneAndUpdate(req.currentUser._id, filteredBody, {
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    message: 'User updated successfully!'
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await UserModel.findOneAndUpdate(req.currentUser._id, { active: false });

  res.status(204).json({
    status: 'success',
    message: 'User deactivated successfully!'
  });
});

exports.deleteUser = factory.deleteOne(UserModel);

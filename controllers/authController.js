const UserModel = require('../models/userModel');
const AppError = require('../utils/errors/AppErrors');

exports.signup = AppError.catchAsync(async (req, res, next) => {
    const newUser = await UserModel.create(req.body);

    res.status(201).json({
        status: 'success',
        message: 'User created successfully!',
        data: {
            user: newUser
        },
    });
});
const UserModel = require('../models/userModel');
const AppError = require('../utils/errors/AppErrors');
const jwt = require('jsonwebtoken');

exports.signup = AppError.catchAsync(async (req, res, next) => {
    const newUser = await UserModel.create(
        {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordConfirmed: req.body.passwordConfirmed,
        }
    );

    const token = jwt.sign(
        { id: newUser._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_TTL }
    );

    res.status(201).json({
        status: 'success',
        message: 'User created successfully!',
        data: {
            token,
            user: newUser
        },
    });
});
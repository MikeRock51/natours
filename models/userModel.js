const mongoose = require('mongoose');
const validator = require('validator');

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name...']
    },
    email: {
        type: String,
        required: [true, 'Please provide your valid email...'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Invalid email, please provide a valid email...']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password...'],
        min: 8
    },
    // passwordConfirmed: {
    // },
    photo: String,
});

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
    validate: [
      validator.isEmail,
      'Invalid email, please provide a valid email...'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password...'],
    min: 8,
    select: false
  },
  passwordConfirmed: {
    type: String,
    required: [true, 'Please confirm your password...'],
    min: 8,
    validate: {
      validator: function(el) {
        return this.password === el;
      },
      message: 'Passwords does not match.'
    }
  },
  photo: String,
  passwordChangedAt: Date
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirmed = undefined;

  next();
});

UserSchema.methods.validatePassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;

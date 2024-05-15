const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const crypto = require('crypto');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema;

let validateEmail = function (email) {
  let re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

let phoneValidate = function (phone) {
  let reg = /^01[0-2,5]{1}[0-9]{8}$/;
  return reg.test(phone);
};

const User = new userSchema({
  firstName: {
    type: String,
    required: [true, 'A User must have a FirstName'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'A User must have a LastName'],
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: 'Email address is required',
    validate: [validateEmail, 'Please fill a valid email address'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please enter you password!'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please enter you password again!'],
    validate: {
      validator: function (el) {
        return el === this.password; // it will only work on SAVE and CREATE
      },
      message: 'Passwords must be the same!',
    },
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required for a User.'],
    validate: [phoneValidate, 'Phone number is incorrect'],
  },
  photo: {
    url: {
      type: String,
      //required: true,
    },
    public_id: {
      type: String,
      // required: true,
    },
  },

  passwordResetToken: String,
  passwordResetExpire: String,
});

User.pre('save', async function (next) {
  if (!this.isModified('password')) next();
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(this.password, salt);
  this.password = hash;
  this.passwordConfirm = undefined;
  next();
});
User.methods.correctPasswords = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
User.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpire = Date.now() + 30 * 60 * 1000;
  return resetToken;
};

User.plugin(uniqueValidator, { message: 'This email is currently in use' });

module.exports = mongoose.model('User', User);

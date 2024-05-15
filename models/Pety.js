const mongoose = require('mongoose');
const validate = require('validate-phone-number-node-js');
const { db } = require('./User');
const petySchema = mongoose.Schema;

let phoneValidate = function (phoneNumber) {
  let reg = /^01[0-2,5]{1}[0-9]{8}$/;
  return reg.test(phoneNumber);
};

let validateEmail = function (email) {
  let re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const appointmentSchema = new mongoose.Schema({
  time: String,
  isAvailable: Boolean,
});

const Pety = new petySchema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    petyName: {
      type: String,
      required: [true, 'name is required for a Pety.'],
    },
    clinicalName: {
      type: String,
    },
    address: {
      type: String,
      required: [true, 'Address is required for a Pety.'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required for a Pety.'],
      validate: [phoneValidate, 'Phone number is incorrect'],
    },
    price: {
      type: Number,
      required: [true, 'Price information is required for a Pety.'],
    },
    animals: {
      type: [String],
      required: [true, 'Animal types are required for a Pety.'],
      enum: ['cat', 'dog'],
    },
    description: {
      type: String,
      required: [true, 'Description are required for a Pety.'],
    },
    role: {
      type: String,
      enum: ['vet', 'petSitter', 'groomer'],
      required: [true, 'Role is required for a Pety.'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: 'Email address is required',
      validate: [validateEmail, 'Please fill a valid email address'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please fill a valid email address',
      ],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    offer: {
      type: Boolean,
      default: false,
    },
    availability: [
      {
        day: { type: String },
        startTime: { type: String },
        endTime: { type: String },
        sessionDuration: { type: String },
      },
    ],
    availabilityFormatted: [
      {
        date: { type: String },
        appointments: [appointmentSchema],
      },
    ],
    lastUpdated: {
      type: String,
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
    location: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
    },
  },
  {
    // options
    toJSON: { virtuals: true }, // when there is a virtual property (not stored in database but calculated from other property) it will show in the query output
    toObject: { virtuals: true },
  },
);
Pety.index({ location: '2dsphere' });

Pety.virtual('reviews', {
  ref: 'Review',
  foreignField: 'petyId',
  localField: '_id',
  options: { select: '_id review rating createdAt -petyId' },
});
module.exports = mongoose.model('Pety', Pety);

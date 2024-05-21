const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const History = require('../models/history');
const Appointment = require('../models/appointment');
const Pety = require('../models/Pety');
const { resourceLimits } = require('worker_threads');

class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  name() {
    if (this.queryString.AnimalName) {
      const name = new RegExp(this.queryString.AnimalName, 'i');

      this.query = this.query.find({ 'animals.animalName': name });
    }
    return this;
  }
  type() {
    if (this.queryString.AnimalType) {
      const type = new RegExp(this.queryString.AnimalType, 'i');
      this.query = this.query.find({ 'animals.animalType': type });
    }
    return this;
  }
}

const sendWithoutToken = (res, data, statusCode) => {
  res.status(statusCode).json({
    status: 'success',
    results: data.length,
    data,
  });
};

exports.addHistory = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.findOneAndUpdate(
    { _id: req.body.appointmentId },
    { $push: { history: req.body.history } },
    { new: true }
  );
  sendWithoutToken(res, appointment, 200);
});

exports.getHistoryForUser = catchAsync(async (req, res, next) => {
  const pety = await Pety.find({
    userId: req.user.id
  });

  let appointments = await Appointment.find({
    owner: req.params.userId,
    petyID: pety.id,
    status: 'approved'
  }).select('_id hasHistory animals date time status');

  let temp = await Appointment.find({
    owner: req.params.userId,
    petyID: pety.id,
    status: 'approved'
  }).select('owner')
    .populate('owner', 'firstName lastName photo');

  res.status(200).json({
    status: 'success',
    numOfVistits: appointments.length,
    user: temp[0],
    data: {
      appointments,
    },
  });
});

exports.getHistoryForAppoinment = catchAsync(async (req, res, next) => {
  let appointment = await Appointment.findOne(
    { _id: req.params.appoinmentId }
  ).populate('owner', 'firstName lastName photo')
  .select('-numberOfVisits');

  res.status(200).json({
    status: 'success',
    user: appointment.owner,
    data: appointment.history,
  });
});

exports.getHistoryForAuthenticatedUser = catchAsync(async (req, res, next) => {
  let appointments = await Appointment.find(
    { owner: req.user.id }
  ).populate({
    path: 'petyID',
    select: 'petyName role photo',
  });
  sendWithoutToken(res, appointments, 200);
});

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const History = require('../models/history');
const Appointment = require('../models/appointment');

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

exports.createHistory = catchAsync(async (req, res, next) => {
  const history = await History.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      history,
    },
  });
});

exports.getHistoryForUser = catchAsync(async (req, res, next) => {
  let Appoinment = await Appointment.find({
    owner: req.params.userId,
  }).select('_id hasHistory animals appointmentDateTime status ');

  let temp = await Appointment.find({
    owner: req.params.userId,
  })
    .select('owner')
    .populate('owner', 'firstName lastName photo');
  res.status(200).json({
    status: 'success',
    numofVistits: Appoinment.length,
    user: temp[0],
    data: {
      Appoinment,
    },
  });
});

exports.getHistoryForAppoinment = catchAsync(async (req, res, next) => {
  let history = await History.find({
    appoinmentId: req.params.appoinmentId,
  }).select('-userId -petyId -appoinmentId');
  let temp = await History.find({
    appoinmentId: req.params.appoinmentId,
  })
    .select('userId')
    .populate('userId', 'firstName lastName photo');

  res.status(200).json({
    status: 'success',
    user: temp[0],
    data: {
      history,
    },
  });
});

exports.getHistoryForAuthenticatedUser = catchAsync(async (req, res, next) => {
  let history = await History.find({ userId: req.user.id }).populate({
    path: 'petyId',
    select: 'petyName role photo',
  });

  res.status(200).json({
    status: 'success',
    results: history.length,
    data: {
      history,
    },
  });
});

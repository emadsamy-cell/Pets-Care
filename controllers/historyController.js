const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const History = require('../models/history');
const { resourceLimits } = require('worker_threads');

class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  name() {
    if (this.queryString.AnimalName) {
      const name = new RegExp(this.queryString.AnimalName, 'i');

      this.query = this.query.find({ animalName: name });
    }
    return this;
  }
  type() {
    if (this.queryString.AnimalType) {
      const type = new RegExp(this.queryString.AnimalType, 'i');
      this.query = this.query.find({ animalType: type });
    }
    return this;
  }
}

exports.createHistory = catchAsync(async (req, res, next) => {
  req.body.userId = req.user._id;
  const history = await History.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      history,
    },
  });
});

exports.getHistory = catchAsync(async (req, res, next) => {
  let history = new ApiFeatures(
    History.find({ userId: req.params.userId }),
    req.query,
  )
    .name()
    .type();
  history = await history.query;

  res.status(200).json({
    status: 'success',
    results: history.length,
    data: {
      history,
    },
  });
});

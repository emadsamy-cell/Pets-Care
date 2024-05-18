const { now } = require('moment/moment');
const Pety = require('../models/Pety');
const User = require('../models/User');
const Appointment = require('../models/appointment');
const catchAsync = require('../utils/catchAsync');
const moment = require('moment-timezone');
const timeZone = 'Africa/Cairo';
const notificationController = require('./notificationController');

class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  role() {
    this.query = this.query.find({ role: this.queryString.role });
    return this;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const exludeFields = ['page', 'sort', 'limit'];

    exludeFields.forEach((el) => delete queryObj[el]);

    return this;
  }

  offer() {
    if (this.queryString.offer) {
      this.query = this.query.find({ offer: true });
    }

    return this;
  }

  animals() {
    if (this.queryString.animals) {
      const animals = this.queryString.animals.split(',');
      this.query = this.query.find({ animals: { $all: animals } });
    }

    return this;
  }

  name() {
    if (this.queryString.petyName) {
      const title = new RegExp(this.queryString.petyName, 'i');
      //.log(title);
      this.query = this.query.find({ petyName: title });
    }

    return this;
  }

  price() {
    if (this.queryString.price == 1) {
      this.query = this.query.find({ price: { $lte: 50 } });
    } else if (this.queryString.price == 2) {
      this.query = this.query.find({ price: { $gt: 50, $lte: 150 } });
    } else if (this.queryString.price == 3) {
      this.query = this.query.find({ price: { $gt: 150, $lte: 300 } });
    } else if (this.queryString.price == 4) {
      this.query = this.query.find({ price: { $gt: 300 } });
    }

    return this;
  }

  customPrice() {
    if (this.queryString.minPrice && this.queryString.maxPrice) {
      const minimum = this.queryString.minPrice;
      const maximum = this.queryString.maxPrice;
      this.query = this.query.find({ price: { $gte: minimum, $lte: maximum } });
    }

    return this;
  }

  minRate() {
    if (this.queryString.minRate) {
      const minimum = this.queryString.minRate;
      this.query = this.query.find({ averageRate: { $gte: minimum } });
    }
    return this;
  }

  availability() {
    const today = moment
      .tz(timeZone)
      .startOf('day')
      .format('dddd')
      .toLowerCase();
    const tomorrow = moment
      .tz(timeZone)
      .startOf('day')
      .format('dddd')
      .toLowerCase();
    if (this.queryString.availability === 'today') {
      this.query = this.query.find({
        availability: {
          $elemMatch: {
            day: today,
          },
        },
      });
    } else if (this.queryString.availability === 'tomorrow') {
      this.query = this.query.find({
        availability: {
          $elemMatch: {
            day: tomorrow,
          },
        },
      });
    } else if (this.queryString.availability === 'anyDay') {
      this.query = this.query.find({
        availability: {
          $exists: true,
        },
      });
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-ratingsAverage price');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 15;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  distance() {
    if (this.queryString.latlng) {
      const { latlng } = this.queryString;
      const [lat, lng] = latlng.split(',');
      const maxDistance = 10000;
      this.query = this.query.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng * 1, lat * 1],
            },
            $maxDistance: maxDistance,
          },
        },
      });
    }

    return this;
  }
}

const sendWithToken = (token, res, data, statusCode) => {
  res.status(statusCode).json({
    status: 'success',
    token,
    data,
  });
};

const sendWithoutToken = (res, data, statusCode) => {
  res.status(statusCode).json({
    status: 'success',
    results: data.length,
    data,
  });
};

exports.becomePety = catchAsync(async (req, res) => {
  const [lat, lng] = req.body.location.coordinates;
  const newPety = await Pety.create({
    userId: req.user.id,
    petyName: req.body.petyName,
    clinicalName: req.body.clinicalName,
    address: req.body.address,
    phoneNumber: req.body.phoneNumber,
    price: req.body.price,
    animals: req.body.animals,
    description: req.body.description,
    role: req.body.role,
    email: req.body.email,
    availability: req.body.availability,
    availabilityFormatted: req.body.availabilityFormatted,
    location: {
      type: req.body.location.type,
      coordinates: [lng * 1, lat * 1],
    },
  });

  sendWithoutToken(res, newPety, 200);
});

const updatePetyTimeTable = async (pety) => {
  const appointmentsOfWeek = [];
  const timeNow = moment.tz(timeZone);
  const today = moment.tz(timeZone).startOf('day');
  const nextWeek = moment.tz(timeZone).add(7, 'days');

  const lastUpdated = pety.lastUpdated;
  // check if last time this pety updated was today don't update
  if (lastUpdated === today.format('DD-MM-YYYY')) {
    return pety;
  }
  
  // otherwise update Availability Formatt
  for (
    let date = moment.tz(today, timeZone);
    date.isBefore(nextWeek);
    date.add(1, 'day')
  ) {
    const dayOfWeek = date.format('dddd').toLowerCase();
    let dayAvailable = pety.availability.find(
      (entry) => entry.day === dayOfWeek,
    );

    if (dayAvailable) {
      const startMoment = moment.tz(
        `${date.format('DD-MM-YYYY')} ${dayAvailable.startTime}`,
        'DD-MM-YYYY HH:mm A',
        timeZone,
      );
      const endMoment = moment.tz(
        `${date.format('DD-MM-YYYY')} ${dayAvailable.endTime}`,
        'DD-MM-YYYY HH:mm A',
        timeZone,
      );
      const sessionDurationMinutes = moment
        .duration(dayAvailable.sessionDuration)
        .asMinutes();
      const appointments = [];

      let currentMoment = startMoment.clone();
      while (currentMoment.isBefore(endMoment)) {
        let appointment = {
          time: currentMoment.format('hh:mm A'),
        };

        const isAppointmentUnavailable = await Appointment.find({
          petyID: pety._id,
          appointmentDateTime: currentMoment.toDate(),
        });
        if (
          (isAppointmentUnavailable.length && isAppointmentUnavailable[0].status != "rejected")
          || currentMoment.toDate() < timeNow.toDate()
        )
          appointment['isAvailable'] = false;
        else appointment['isAvailable'] = true;

        appointments.push(appointment);
        currentMoment.add(sessionDurationMinutes, 'minutes');
      }

      const appointmentsDay = {
        date: date.format('DD-MM-YYYY'),
        appointments: appointments,
      };
      appointmentsOfWeek.push(appointmentsDay);
    }
  }

  pety.availabilityFormatted = appointmentsOfWeek;
  pety.lastUpdated = today.format('DD-MM-YYYY');
  await pety.save();
  return pety;
};

exports.getAllPety = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(Pety.find(), req.query)
    .role()
    .filter()
    .price()
    .customPrice()
    .minRate()
    .availability()
    .offer()
    .animals()
    .name()
    .sort()
    .distance()
    .paginate();
  let allPety = await features.query.select('-__v -userId');

  for (let pety of allPety) {
    pety = await updatePetyTimeTable(pety);
  }

  sendWithoutToken(res, allPety, 200);
});

exports.petyDetail = catchAsync(async (req, res) => {
  let pety = await Pety.findById(req.body.id).populate({
    path: 'reviews',
    populate: {
      path: 'user',
      select: '_id photo firstName lastName',
      model: 'User',
    },
  });

  pety = await updatePetyTimeTable(pety);
  sendWithoutToken(res, pety, 200);
});

exports.pages = catchAsync(async (req, res) => {
  const features = new ApiFeatures(Pety.find(), req.query)
    .role()
    .distance()
    .price()
    .customPrice()
    .minRate()
    .availability()
    .offer()
    .animals()
    .name();

  const cnt = await features.query.select('-__v -userId');
  const limit = req.query.limit * 1 || 15;
  const pages = parseInt((cnt.length + limit - 1) / limit);

  sendWithoutToken(res, pages, 200);
});

exports.appointment = catchAsync(async (req, res) => {
  const { petyID, date, time, animals } = req.body;
  const owner = req.user;
  const appointmentDateTime = moment.tz(
    `${date} ${time}`,
    'DD-MM-YYYY HH:mm A',
    timeZone,
  );

  // make the appointment un available
  await Pety.findOneAndUpdate(
    {
      _id: petyID,
      'availabilityFormatted.date': date,
      'availabilityFormatted.appointments.time': time,
    },
    {
      $set: {
        'availabilityFormatted.$[outer].appointments.$[inner].isAvailable': false,
      },
    },
    {
      arrayFilters: [{ 'outer.date': date }, { 'inner.time': time }],
      new: true,
    },
  );
  // store the appointment
  const appointment = await Appointment.create({
    petyID: petyID,
    owner: owner.id,
    animals: animals,
    appointmentDateTime: appointmentDateTime,
    date: date,
    time: time,
  });
  req.result = appointment;
  await notificationController.newAppoinment(req, res);
  sendWithoutToken(res, appointment, 201);
});

exports.appointmentStatus = catchAsync(async (req, res) => {
  const appointment = await Appointment.findOneAndUpdate(
    { _id: req.params.appointmentId, petyID: req.params.petyId },
    { status: req.body.status },
    { new: true },
  );
  const newNotification = new Notification({
    title: 'Appointment Status',
    message: `Appointment status updated to ${appointment.status}`,
    userId: appointment.owner,
  });

  await newNotification.save();
  io.emit('appointment-status-updated', newNotification);
  sendWithoutToken(res, appointment, 200);
});

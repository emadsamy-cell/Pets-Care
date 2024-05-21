const AppError = require('../utils/appError');
const Pety = require('../models/Pety');
const Appointment = require('../models/appointment');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const cloudinary = require('../utils/cloudinary');
const moment = require('moment-timezone');
const timeZone = 'Africa/Cairo';
const multerStorage = multer.diskStorage({});
const upload = multer({ storage: multerStorage });
const notificationController = require('./notificationController');

const sendWithoutToken = (res, data, statusCode) => {
  res.status(statusCode).json({
    status: 'success',
    results: data.length,
    data,
  });
};

exports.allRoles = catchAsync(async (req, res) => {
  const result = await Pety.find({ userId: req.user._id });
  const roles = [];
  for (const el of result) {
    roles.push(el.role);
  }
  sendWithoutToken(res, roles, 200);
});

exports.workingHours = catchAsync(async (req, res) => {
  const result = await Pety.findOne(
    { userId: req.user._id, role: req.body.role },
    { availability: 1, _id: 0 },
  );

  sendWithoutToken(res, result.availability, 200);
});

exports.petyInformation = catchAsync(async (req, res) => {
  const result = await Pety.find({ userId: req.user._id, role: req.body.role });

  sendWithoutToken(res, result, 200);
});

const updateAppointmentStatus = catchAsync(async (pety) => {
  let appointments = await Appointment.find({
    petyID: pety._id,
  });

  const timeNow = moment.tz(timeZone);
  for (let appointment of appointments) {
    if (
      appointment.status === 'pending' &&
      appointment.appointmentDateTime < timeNow.toDate()
    ) {
      appointment.status = 'rejected';
      await appointment.save();
    }
  }
});

exports.allAppointments = catchAsync(async (req, res) => {
  const pety = await Pety.findOne({
    role: req.body.role,
    userId: req.user.id,
  });
  updateAppointmentStatus(pety);

  appointments = await Appointment.aggregate([
    {
      $match: {
        petyID: pety._id,
      },
    },
    {
      $addFields: {
        // Assign numerical values to each status
        statusOrder: {
          $switch: {
            branches: [
              { case: { $eq: ['$status', 'pending'] }, then: 1 },
              { case: { $eq: ['$status', 'approved'] }, then: 2 },
            ],
            default: 3,
          },
        },
      },
    },
    {
      $sort: {
        statusOrder: 1, // Sort by statusOrder in ascending order
        appointmentDateTime: 1,
      },
    },
    {
      $lookup: {
        from: 'users', // Name of the collection to join
        localField: 'owner', // Field from the appointments collection
        foreignField: '_id', // Field from the users collection
        as: 'owner', // Name of the field to populate
      },
    },
    {
      $project: {
        statusOrder: 0, // Exclude the statusOrder field from the final output
      },
    },
  ]);

  for (let appointment of appointments) {
    appointment.numberOfVisits = await Appointment.countDocuments({
      owner: appointment.owner,
      petyID: appointment.petyID,
      status: 'approved'
    });
  }
  sendWithoutToken(res, appointments, 200);
});

exports.changeAppointment = catchAsync(async (req, res) => {
  if (req.body.status === "rejected") {
    const pet = await Pety.findOneAndUpdate(
      { userId: req.user.id, role: req.body.role },
      {
        $set: { lastUpdated: '00-00-0000' },
      },
      { new: true },
    );
  }

  const appointmentID = req.body.id;
  const newStatus = req.body.status;
  const result = await Appointment.findOneAndUpdate(
    { _id: appointmentID },
    { $set: { status: newStatus } },
    { new: true },
  ).select('-numberOfVisits');
  result.message = req.body.message || 'wait for your visit';
  req.result = result;
  await notificationController.satusUpdate(req, res);
  sendWithoutToken(res, result, 200);
});

exports.uploadUserPhoto = upload.single('photo');
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updatePety = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(
    req.body,
    'petyName',
    'clinicalName',
    'address',
    'phoneNumber',
    'price',
    'animals',
    'description',
    'email',
    'offer',
  );

  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'users',
    });

    filteredBody.photo = {
      url: result.secure_url,
      public_id: result.public_id,
    };
  }

  if (req.body.coordinates) {
    const [lat, lng] = req.body.coordinates.split(',');
    filteredBody.location = {
      type: 'Point',
      coordinates: [lng * 1, lat * 1],
    };
  }

  if (req.body.role) {
    const pety = await Pety.find({ userId: req.user.id, role: req.body.role });
    if (!pety.length) {
      return next(
        new AppError(
          `you need to become ${req.body.role} first to proceed`,
          401,
        ),
      );
    }
  } else {
    return next(new AppError(`Please declare your role first to proceed`, 401));
  }

  const pety = await Pety.findOneAndUpdate(
    { userId: req.user.id, role: req.body.role },
    filteredBody,
    { new: true, runValidators: true },
  );

  sendWithoutToken(res, pety, 200);
});

exports.timeTable = catchAsync(async (req, res) => {
  const result = await Pety.updateOne(
    { userId: req.user.id, role: req.body.role },
    {
      $set: { availability: req.body.availability, lastUpdated: '00-00-0000' },
    },
    { new: true },
  );

  sendWithoutToken(res, result, 200);
});

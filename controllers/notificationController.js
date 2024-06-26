const socketInstance = require('../utils/socketInstance');
const Notification = require('../models/notification');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/User');
exports.satusUpdate = catchAsync(async (req, res, next) => {
  const newNotification = new Notification({
    title: 'Appointment Status',
    message: `Appointment status has been successfully updated to ${req.result.status} 
    Message from the pety: ${req.result.message}`,
    userId: req.result.owner,
    appointmentId: req.result.id,
  });
  await newNotification.save();

  socketInstance
    .getIOInstance()
    .emit('appointment-status-updated', newNotification);
});

exports.newAppoinment = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.result.owner);

  const newNotification = new Notification({
    title: 'New Appointment',
    message: `New appointment from ${user.firstName}`,
    petyId: req.result.petyID,
    appointmentId: req.result.id,
  });

  await newNotification.save();
  socketInstance.getIOInstance().emit('new-appointment', newNotification);
});

exports.newReview = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.result.user);

  const newNotification = new Notification({
    title: 'New Review',
    message: `You have new review from ${user.firstName}`,
    petyId: req.result.petyId,
    reviewId: req.result.id,
  });

  await newNotification.save();
  socketInstance.getIOInstance().emit('new-review', newNotification);
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.result.user);

  const newNotification = new Notification({
    title: 'Updated Review',
    message: `You have an updated review from ${user.firstName}`,
    petyId: req.result.petyId,
    reviewId: req.result.id,
  });

  await newNotification.save();
  socketInstance.getIOInstance().emit('update-review', newNotification);
});

exports.readNotification = catchAsync(async (req, res, next) => {
  let notification = await Notification.findById(req.body.notificationId);
  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }
  if (notification.reviewId) {
    if (notification.userId) {
      notification = await Notification.findById(req.body.notificationId)
        .populate('reviewId')
        .populate('userId');
    } else {
      notification = await Notification.findById(req.body.notificationId)
        .populate('reviewId')
        .populate('petyId');
    }
  } else if (notification.appointmentId) {
    if (notification.userId) {
      notification = await Notification.findById(req.body.notificationId)
        .populate('appointmentId')
        .populate('userId');
    } else {
      notification = await Notification.findById(req.body.notificationId)
        .populate('appointmentId')
        .populate('petyId');
    }
  }
  console.log(notification);

  notification.isRead = true;
  await notification.save();
  res.status(200).json({
    status: 'success',
    data: {
      notification,
    },
  });
});

exports.deleteNotification = catchAsync(async (req, res, next) => {
  let notification = await Notification.findById(req.body.notificationId);
  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }
  await Notification.findByIdAndDelete(req.body.notificationId);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getNotificationForOneUser = catchAsync(async (req, res, next) => {
  let notification = await Notification.find({ petyId: req.params.id });
  if (notification.length <= 0) {
    notification = await Notification.find({ userId: req.params.id });
  }

  if (notification.length <= 0) {
    return next(new AppError("User doesn't have any notification yet", 200));
  }

  res.status(200).json({
    status: 'success',
    reults: notification.length,
    data: { notification },
  });
});

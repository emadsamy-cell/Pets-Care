const mongoose = require('mongoose');
const notificationSchema = mongoose.Schema;

const Notification = new notificationSchema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  petyId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Pety',
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  appointmentId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Appointment',
  },
  reviewId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Review',
  },
});

module.exports = mongoose.model('Notification', Notification);

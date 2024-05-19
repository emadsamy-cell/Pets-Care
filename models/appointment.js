const mongoose = require('mongoose');
const appointmentSchema = mongoose.Schema;
let phoneValidate = function (phoneNumber) {
  let reg = /^01[0-2,5]{1}[0-9]{8}$/;
  return reg.test(phoneNumber);
};
const Appointment = new appointmentSchema({
  petyID: {
    type: mongoose.Schema.ObjectId,
    ref: 'Pety',
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  animals: [
    {
      pet: { type: String },
      count: { type: Number },
    },
  ],
  appointmentDateTime: {
    type: Date,
    //required: [true, 'Please provide the date and time for the appointment.'],
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  hasHistory: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Appointment', Appointment);

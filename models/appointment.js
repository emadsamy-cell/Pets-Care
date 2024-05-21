const mongoose = require('mongoose');
const appointmentSchema = mongoose.Schema;
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
  numberOfVisits: {
    type: Number,
    default: 0
  },
  history: [
    {
      animalName: {
        type: String,
        required: [true, 'Please provide the name of the animal.'],
      },
      animalType: {
        type: String,
        required: [true, 'Please provide the type of the animal.'],
      },
      DiagnosisName: {
        type: String,
        required: [true, 'Please provide the name of the diagnosis.'],
      },
      symptoms: {
        type: String,
        required: [true, 'Please provide the Symptoms.'],
      },

      medicineName: {
        type: String,
        required: [true, 'Please provide the name of the medicine.'],
      },
    },
  ]
});

module.exports = mongoose.model('Appointment', Appointment);

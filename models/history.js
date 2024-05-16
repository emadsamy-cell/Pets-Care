const mongoose = require('mongoose');
const historySchema = mongoose.Schema;

const History = new historySchema({
  petyId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Pety',
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  appoinmentId: {
    type: mongoose.Schema.ObjectId,
    ref: 'appoinment',
  },
  animals: [
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
      symptoms: [
        {
          type: String,
          required: [true, 'Please provide the Symptoms.'],
        },
      ],
      medicineName: [
        {
          type: String,
          required: [true, 'Please provide the name of the medicine.'],
        },
      ],
    },
  ],
});

module.exports = mongoose.model('History', History);

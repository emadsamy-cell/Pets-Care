const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Pety = require('../models/Pety');

dotenv.config({ path: './config/config.env' });

mongoose.connect(process.env.MONGO_URI, {});
mongoose.set('setDefaultsOnInsert', true);

// delete all the data from DB
const deletee = async () => {
  try {
    await Pety.deleteMany();

    console.log('data successfuly deleted');
    process.exit();
  } catch (e) {
    console.log(e);
  }
};

if (process.argv[2] === '--delete') deletee(); // node data/import.js --delete

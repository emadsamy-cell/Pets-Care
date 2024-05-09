const cloudinary = require('cloudinary').v2;

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});
console.log(
  'Cloudinary Configured',
  process.env.CLOUD_NAME,
  process.env.API_KEY,
  process.env.API_SECRET,
);
// console.log('All Environment Variables:', process.env);

module.exports = cloudinary;

const Tag = require('../models/Tag');
const catchAsync = require('../utils/catchAsync');

const sendWithoutToken = (res, data, statusCode) => {
  res.status(statusCode).json({
    status: 'success',
    results: data.length,
    data,
  });
};

exports.allTags = catchAsync(async (req, res) => {
  const Tags = await Tag.find();

  sendWithoutToken(res, Tags, 200);
});


exports.create = catchAsync(async (req, res) => {
  const newTag = await Tag.create({
    name: req.body.name
  });

  sendWithoutToken(res, newTag, 200);
});
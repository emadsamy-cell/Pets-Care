const mongoose = require('mongoose');
const Pety = require('./Pety');
const moment = require('moment-timezone');
const timeZone = 'Africa/Cairo';
const ReviewSchema = mongoose.Schema;
const Review = new ReviewSchema(
  {
    review: {
      type: String,
      required: [true, "Review can't be empty"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: () => moment().tz(timeZone).toDate(),
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
    petyId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Pety',
      required: [true, 'Review must belong to a pety.'],
    },
  },
  {
    // options
    toJSON: { virtuals: true }, // when there is a virtual property (not stored in database but calculated from other property) it will show in the query output
    toObject: { virtuals: true },
  },
);

Review.index({ petyId: 1, user: 1 }, { unique: true });

Review.statics.calcAverageRatings = async function (petyId) {
  const stats = await this.aggregate([
    {
      $match: { petyId },
    },
    {
      $group: {
        _id: '$petyId',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Pety.findByIdAndUpdate(petyId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Pety.findByIdAndUpdate(petyId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};
//findOneAndUpdate, findOneAndDelete is query middleware (this refers to current query )
Review.pre(/^findOneAnd/, async function (next) {
  this.r = await this.clone().findOne();
  next();
});
Review.post(/^findOneAnd/, async function () {
  this.r.constructor.calcAverageRatings(this.r.petyId);
});
//save is document middleware (this refers to current document)
Review.post('save', async function () {
  this.constructor.calcAverageRatings(this.petyId);
});

module.exports = mongoose.model('Review', Review);

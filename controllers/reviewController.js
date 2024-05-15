const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Review = require('../models/Review');
const notificationController = require('./notificationController');

const sendWithoutToken = (res, data, statusCode) => {
  res.status(statusCode).json({
    status: 'success',
    data,
  });
};

exports.addReview = catchAsync(async (req, res, next) => {
  let review = await Review.create({
    user: req.user.id,
    petyId: req.body.petyId,
    review: req.body.review,
    rating: req.body.rating,
  });

  req.result = review;
  await notificationController.newReview(req, res, next);
  review = await Review.findById(review._id).populate({
    path: 'user',
    select: '_id photo firstName lastName',
    model: 'User',
  });
  sendWithoutToken(res, review, 201);
});

exports.updateReview = catchAsync(async (req, res, next) => {
  let review = await Review.findById(req.body.reviewId);
  if (!review) {
    return next(new AppError('Review not found', 404));
  }
  if (review.user.toString() !== req.user.id.toString()) {
    return next(
      new AppError(
        "You Can't update this review, because you are not the owner of this review!",
        401,
      ),
    );
  }
  req.result = review;
  review = await Review.findByIdAndUpdate(
    req.body.reviewId,
    {
      review: req.body.review,
      rating: req.body.rating,
    },
    { new: true },
  ).populate({
    path: 'user',
    select: '_id photo firstName lastName',
    model: 'User',
  });
  await notificationController.updateReview(req, res, next);
  sendWithoutToken(res, review, 201);
});

exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.reviewId);
  sendWithoutToken(res, review, 200);
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();
  sendWithoutToken(res, reviews, 200);
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  let review = await Review.findById(req.body.reviewId);
  if (review.user.toString() !== req.user.id.toString()) {
    return next(
      new AppError(
        "You Can't delete this review, because you are not the owner of this review!",
        401,
      ),
    );
  }
  review = await Review.findByIdAndDelete(req.body.reviewId);

  sendWithoutToken(res, review, 204);
});

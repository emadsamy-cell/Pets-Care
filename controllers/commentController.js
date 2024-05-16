const Comment = require('../models/Comment');
const catchAsync = require('../utils/catchAsync');

const sendWithoutToken = (res, data, statusCode) => {
  res.status(statusCode).json({
    status: 'success',
    results: data.length,
    data,
  });
};

exports.allComments = catchAsync(async (req, res) => {
  const comments = await Comment.find({
    postId: req.body.postId
  }).populate({
    path: 'user',
    select: '_id photo firstName lastName',
    model: 'User',
  });

  sendWithoutToken(res, comments, 200);
});


const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.create = catchAsync(async (req, res) => {
  const result = await Comment.create({
    postId: req.body.postId,
    user: req.user.id,
    context: req.body.context
  })
   
  const comment = await Comment.findById(result._id).populate({
    path: 'user',
    select: '_id photo firstName lastName',
    model: 'User',
  });

  sendWithoutToken(res, comment, 200);
});

exports.auth = catchAsync(async (req, res, next) => {
  // check if the current user is the owenr of the post
  const result = Comment.find({ _id: req.body.commentId, user: req.user.id });
  if (!result) {
    return next(
      new AppError(
        "You have no access to this comment, because you are not the author",
        401,
      ),
    );
  }
  next();
});

exports.update = catchAsync(async (req, res) => {
  const filteredBody = filterObj(
    req.body,
    'context',
  );

  const comment = await Comment.findByIdAndUpdate(
    req.body.commentId,
    filteredBody,
    { new: true }
  ).populate({
    path: 'user',
    select: '_id photo firstName lastName',
    model: 'User',
  });
  
  sendWithoutToken(res, comment, 200);
});

exports.delete = catchAsync(async (req, res) => {
  comment = await Comment.findByIdAndDelete(req.body.commentId);

  sendWithoutToken(res, comment, 204);
});

exports.upvote = catchAsync(async (req, res) => {
  const isUpvoted = await Comment.find({
    upvotes: req.user.id 
  });

  if (!isUpvoted.length) {
    const isDownvoted = await Comment.find({
      downvotes: req.user.id
    });

    if (isDownvoted.length) {
      await Comment.findByIdAndUpdate(
        req.body.commentId,
        {
          $pull: { downvotes: req.user.id },
          $inc: { votes: 1 }
        },
        { new: true }
      );
    }

    await Comment.findByIdAndUpdate(
      req.body.commentId,
      {
        $push: { upvotes: req.user.id },
        $inc: { votes: 1 }
      },
      { new: true }
    );
  }

  const comment = await Comment.findById(req.body.commentId).populate({
    path: 'user',
    select: '_id photo firstName lastName',
    model: 'User',
  });

  sendWithoutToken(res, comment, 201);
});

exports.downvote = catchAsync(async (req, res) => {
  const isDownvoted = await Comment.find({
    downvotes: req.user.id
  });

  if (!isDownvoted.length) {
    const isUpvoted = await Comment.find({
      upvotes: req.user.id 
    })

    if (isUpvoted.length) {
      await Comment.findByIdAndUpdate(
        req.body.commentId,
        {
          $pull: { upvotes: req.user.id },
          $inc: { votes: -1 }
        },
        { new: true }
      );
    }

    await Comment.findByIdAndUpdate(
      req.body.commentId,
      {
        $push: { downvotes: req.user.id },
        $inc: { votes: -1 }
      },
      { new: true }
    );
  }

  const comment = await Comment.findById(req.body.commentId).populate({
    path: 'user',
    select: '_id photo firstName lastName',
    model: 'User',
  });

  sendWithoutToken(res, comment, 201);
});

exports.resetvote = catchAsync(async (req, res) => {
  const isDownvoted = await Comment.find({
    downvotes: req.user.id
  });
  if (isDownvoted.length) {
    await Comment.findByIdAndUpdate(
      req.body.commentId,
      {
        $pull: { downvotes: req.user.id },
        $inc: { votes: 1 }
      },
      { new: true }
    );
  }

  const isUpvoted = await Comment.find({
    upvotes: req.user.id 
  });
  if (isUpvoted.length) {
    await Comment.findByIdAndUpdate(
      req.body.commentId,
      {
        $pull: { upvotes: req.user.id },
        $inc: { votes: -1 }
      },
      { new: true }
    );
  }

  const comment = await Comment.findById(req.body.commentId).populate({
    path: 'user',
    select: '_id photo firstName lastName',
    model: 'User',
  });
  
  sendWithoutToken(res, comment, 201);
});
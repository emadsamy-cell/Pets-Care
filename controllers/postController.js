const AppError = require('../utils/appError');
const Post = require('../models/Post');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const cloudinary = require('../utils/cloudinary');
const multerStorage = multer.diskStorage({});
const upload = multer({ storage: multerStorage });

class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  tag() {
    if (this.queryString.tag) {
      const tag = this.queryString.tag;
      this.query = this.query.find({'tags': tag});
    }

    return this;
  }

  name() {
    if (this.queryString.name) {
      const reg = new RegExp(this.queryString.name, 'i');
      this.query = this.query.find({ $or: [ 
        { title: reg }, 
        { context: reg }
       ] 
      });
    }

    return this;
  }

  top() {
    // get all posts created from current time to top time
    // default get last 30 days
    let days = 30;

    if (this.queryString.top) {
      days = this.queryString.top;
    }

    const lastDate = new Date();
    lastDate.setDate(lastDate.getDate() - days);
    this.query = this.query.find({ createdAt: 
      { $gte: lastDate, 
        $lte: new Date() } 
    });

    return this;
  }

  sort() {
    // sort by top votes
    this.query = this.query.sort('-votes');

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 15;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

const sendWithoutToken = (res, data, statusCode) => {
  res.status(statusCode).json({
    status: 'success',
    results: data.length,
    data,
  });
};

exports.allPosts = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(Post.find(), req.query)
    .tag()
    .top()
    .name()
    .sort()
    .paginate();

  const allPosts = await features.query.populate({
    path: 'user',
    select: '_id photo firstName lastName',
    model: 'User',
  }).select('-__v ');

  sendWithoutToken(res, allPosts, 200);
});

exports.pages = catchAsync(async (req, res) => {
  const features = new ApiFeatures(Post.find(), req.query)
    .tag()
    .name()
    .top();

  const cnt = await features.query.select('-__v -userId');
  const limit = req.query.limit * 1 || 15;
  const pages = parseInt((cnt.length + limit - 1) / limit);

  sendWithoutToken(res, pages, 200);
});

exports.myPosts = catchAsync(async (req, res) => {
  const features = new ApiFeatures(Post.find({ user: req.user.id }), req.query)
    .tag()
    .top()
    .name()
    .sort()
    .paginate();

  const myPosts = await features.query.populate({
    path: 'user',
    select: '_id photo firstName lastName',
    model: 'User',
  }).select('-__v ');

  sendWithoutToken(res, myPosts, 200);
});

exports.getBookmarks = catchAsync(async (req, res) => {
  const features = new ApiFeatures(Post.find({ bookmarks: req.user.id }), req.query)
    .tag()
    .top()
    .name()
    .sort()
    .paginate();

  const myPosts = await features.query.populate({
    path: 'user',
    select: '_id photo firstName lastName',
    model: 'User',
  }).select('-__v ');

  sendWithoutToken(res, myPosts, 200);
});

exports.addBookmark = catchAsync(async (req, res) => {
  const post = await Post.findByIdAndUpdate(
    req.body.postId,
    { $addToSet: { bookmarks: req.user.id } },
    { new: true }
  ).populate({
    path: 'user',
    select: '_id photo firstName lastName',
    model: 'User',
  });
  
  sendWithoutToken(res, post, 200);
});

exports.onePost = catchAsync(async (req, res, next) => {
  const post = await Post.find({ _id: req.body.postId }).populate({
    path: 'user',
    select: '_id photo firstName lastName',
    model: 'User',
  });

  sendWithoutToken(res, post, 200);
});

exports.uploadPostPhoto = upload.single('photo');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.create = catchAsync(async (req, res) => {
  const tags = req.body.tags.split(',');
  let newPost;
  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'users',
    });

    const photo = {
      url: result.secure_url,
      public_id: result.public_id,
    };

    newPost = await Post.create({
      user: req.user.id,
      title: req.body.title,
      context: req.body.context,
      photo: photo,
      tags: tags
    });

  } else {
    newPost = await Post.create({
      user: req.user.id,
      title: req.body.title,
      context: req.body.context,
      tags: tags
    });
  }

  const post = await Post.find({ _id: newPost._id }).populate({
    path: 'user',
    select: '_id photo firstName lastName',
    model: 'User',
  });

  sendWithoutToken(res, post, 200);
});

exports.auth = catchAsync(async (req, res, next) => {
  // check if the current user is the owenr of the post
  const result = Post.find({ _id: req.body.postId, user: req.user.id });
  if (!result) {
    return next(
      new AppError(
        "You have no access to this post, because you are not the author",
        401,
      ),
    );
  }
  next();
});

exports.update = catchAsync(async (req, res) => {
  const filteredBody = filterObj(
    req.body,
    'title',
    'context',
  );

  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'users',
    });

    filteredBody.photo = {
      url: result.secure_url,
      public_id: result.public_id,
    };
  }

  if (req.body.tags) {
    const tags = req.body.tags.split(',');
    filteredBody.tags = tags;
  }

  const post = await Post.findByIdAndUpdate(
    req.body.postId,
    filteredBody,
    { new: true }
  ).populate({
    path: 'user',
    select: '_id photo firstName lastName',
    model: 'User',
  });
  
  sendWithoutToken(res, post, 200);
});

exports.delete = catchAsync(async (req, res) => {
  post = await Post.findByIdAndDelete(req.body.postId);

  sendWithoutToken(res, post, 204);
});

exports.removeBookmark = catchAsync(async (req, res) => {
  const post = await Post.findByIdAndUpdate(
    req.body.postId,
    { $pull: { bookmarks: req.user.id } },
    { new: true }
  ).populate({
    path: 'user',
    select: '_id photo firstName lastName',
    model: 'User',
  });
  
  sendWithoutToken(res, post, 200);
});

exports.upvote = catchAsync(async (req, res) => {
  const isUpvoted = await Post.find({
    upvotes: req.user.id 
  })

  if (!isUpvoted.length) {
    const isDownvoted = await Post.find({
      downvotes: req.user.id
    });

    if (isDownvoted.length) {
      await Post.findByIdAndUpdate(
        req.body.postId,
        {
          $pull: { downvotes: req.user.id },
          $inc: { votes: 1 }
        },
        { new: true }
      );
    }

    await Post.findByIdAndUpdate(
      req.body.postId,
      {
        $push: { upvotes: req.user.id },
        $inc: { votes: 1 }
      },
      { new: true }
    );
  }

  const post = await Post.findById(req.body.postId).populate({
    path: 'user',
    select: '_id photo firstName lastName',
    model: 'User',
  });

  sendWithoutToken(res, post, 201);
});

exports.downvote = catchAsync(async (req, res) => {
  const isDownvoted = await Post.find({
    downvotes: req.user.id
  });

  if (!isDownvoted.length) {
    const isUpvoted = await Post.find({
      upvotes: req.user.id 
    })

    if (isUpvoted.length) {
      await Post.findByIdAndUpdate(
        req.body.postId,
        {
          $pull: { upvotes: req.user.id },
          $inc: { votes: -1 }
        },
        { new: true }
      );
    }

    await Post.findByIdAndUpdate(
      req.body.postId,
      {
        $push: { downvotes: req.user.id },
        $inc: { votes: -1 }
      },
      { new: true }
    );
  }

  const post = await Post.findById(req.body.postId).populate({
    path: 'user',
    select: '_id photo firstName lastName',
    model: 'User',
  });

  sendWithoutToken(res, post, 201);
});

exports.resetvote = catchAsync(async (req, res) => {
  const isDownvoted = await Post.find({
    downvotes: req.user.id
  });
  if (isDownvoted.length) {
    await Post.findByIdAndUpdate(
      req.body.postId,
      {
        $pull: { downvotes: req.user.id },
        $inc: { votes: 1 }
      },
      { new: true }
    );
  }

  const isUpvoted = await Post.find({
    upvotes: req.user.id 
  });
  if (isUpvoted.length) {
    await Post.findByIdAndUpdate(
      req.body.postId,
      {
        $pull: { upvotes: req.user.id },
        $inc: { votes: -1 }
      },
      { new: true }
    );
  }

  const post = await Post.findById(req.body.postId).populate({
    path: 'user',
    select: '_id photo firstName lastName',
    model: 'User',
  });
  
  sendWithoutToken(res, post, 201);
});
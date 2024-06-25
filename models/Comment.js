const mongoose = require('mongoose');
const moment = require('moment-timezone');
const timeZone = 'Africa/Cairo';
const CommentSchema = mongoose.Schema;
const Comment = new CommentSchema(
  {
    postId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Post',
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    context: {
        type: String,
        required: [true, 'context is required for a Comment.'],
    },
    createdAt: {
        type: Date,
        default: () => moment().tz(timeZone).toDate(),
    },
    votes: {
        type: Number,
        default: 0
    },
    upvotes: [ String ],
    downvotes: [ String ],
  },
  {
    // options
    toJSON: { virtuals: true }, // when there is a virtual property (not stored in database but calculated from other property) it will show in the query output
    toObject: { virtuals: true },
  },
);


module.exports = mongoose.model('Comment', Comment);

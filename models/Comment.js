const mongoose = require('mongoose');
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
        default: Date.now(),
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

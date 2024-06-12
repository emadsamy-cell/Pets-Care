const mongoose = require('mongoose');
const moment = require('moment-timezone');
const timeZone = 'Africa/Cairo';
const PostSchema = mongoose.Schema;
const Post = new PostSchema(
  {
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    title: {
        type: String,
        required: [true, 'title is required for a post.'],
    },
    context: {
        type: String,
        required: [true, 'context is required for a post.'],
    },
    photo: {
        url: {
            type: String,
            //required: true,
        },
        public_id: {
            type: String,
            // required: true,
        },
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
    tags: [ String ],
    bookmarks: [ String ]
  },
  {
    // options
    toJSON: { virtuals: true }, // when there is a virtual property (not stored in database but calculated from other property) it will show in the query output
    toObject: { virtuals: true },
  },
);


module.exports = mongoose.model('Post', Post);

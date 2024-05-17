const mongoose = require('mongoose');
const TagSchema = mongoose.Schema;
const Tag = new TagSchema(
  {
    name: {
        type: String
    }
  },
  {
    // options
    toJSON: { virtuals: true }, // when there is a virtual property (not stored in database but calculated from other property) it will show in the query output
    toObject: { virtuals: true },
  },
);


module.exports = mongoose.model('Tag', Tag);

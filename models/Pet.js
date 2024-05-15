const mongoose=require('mongoose');
const petSchema=mongoose.Schema;

const Pet=new petSchema({
  petname:{
    type:String,
    required:[true,"A pet must have a name"],
    trim:true,
  },
  weight:{
    type:String,
    required:[true,"A pet must have a Weight"],
  },
  type:{
    type:String,
    required:[true,"A pet must have a type"],
    trim:true,
  },
  ownerid:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
    },
  photo:
  {
    contentType:String,
    data:Buffer,
  }


})
module.exports=mongoose.model('Pet',Pet);

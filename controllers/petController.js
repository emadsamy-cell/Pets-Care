const Pet=require('../models/Pet');


const createNewPet=async(req,res)=>
{
  try {
 
    const {petname,weight,type}=req.body;
    // console.log(req.body);
    if(!petname||!weight||!type)
    {
     throw new Error('Please fill all required fields');
    }
    else {
      const pet=await Pet.create(req.body);
        res.json({
          status:"sucess",
          data:pet
        })
    }


  } catch (e) {

      console.log(e);
      res.json({
        status:"fail",
        message:e
      })
  }


}
const getPetData=async(req,res)=>{
  try {
    const petid=req.params.id;
    const pet=await Pet.findById(petid);
    res.json({
      status:"sucess",
      data:pet
    })


  } catch (e) {
          console.log(e);
          res.json({
            status:"fail",
            message:e
          })
  }


}
const deletePet=async(req,res)=>{
  try {
    const petid=req.params.id;
    await Pet.findByIdAndDelete(petid);
    res.json({
      status:"sucess",
    })


  } catch (e) {
          console.log(e);
          res.json({
            status:"fail",
            message:e
          })
  }


}
const updatePetData=async(req,res)=>{
  try {
    const petid=req.params.id;
   const pet = await Pet.findByIdAndUpdate(petid,req.body,{
      new:true ,
      runValidators:true,
    });
    res.json({
      status:"sucess",
      data:pet
    })


  } catch (e) {
          console.log(e);
          res.json({
            status:"fail",
            message:e
          })
  }


}

module.exports={
createNewPet,
getPetData,
deletePet,
updatePetData
}

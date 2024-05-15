const AppError=require('../utils/appError');
const handleJWTErrors= ()=>  new AppError('Invaild token! Please log in again.',401);
const handleJWTExpiredErrors=()=>new AppError('Your token has expired! Please log in again.',401);
const handleValidationError = (err) => {
  let errors = Object.values(err.errors).map(el => el.message);
  return new AppError(errors[0], 500);
}

const sendErrorDev= (err,res)=>{
  err.statusCode=err.statusCode||500;
  err.status=err.status||'error';  
  res.status(err.statusCode).json({
    status:err.status,
    message: err.message,
    data: null
  })
}



const error= (err,req,res,next)=>
{
  let error={...err};
  error.message=err.message;
  if(error.name==='JsonWebTokenError')error=handleJWTErrors();
  if(error.name==='TokenExpiredError')error=handleJWTExpiredErrors();
  if(err.name === "ValidationError")error = handleValidationError(err);

  sendErrorDev(error,res);

}

module.exports=error;
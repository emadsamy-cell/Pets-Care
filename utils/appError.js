class AppError extends Error{
    constructor(message,statusCode)
    {
        super(message);
        this.statusCode=statusCode;
        this.status=`${statusCode}`.startsWith('4')?'fail':'error';// `` to covert the number of statusCode to a string
        
        this.isOpertional=true;
        Error.captureStackTrace(this,this.constructor);
    }
}
module.exports=AppError;
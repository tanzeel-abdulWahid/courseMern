const errorHandler = (err, req, res, next) => {
    console.log("ERR",err.stack);

    const status = res.statusCode ? res.statusCode : 500;
    
    res.status(status);
    res.json({
        success:false,
        message:err.message,
    })
}
export default errorHandler
export const sendToken = (res, user, message, statusCode) => {
    
    const token = user.getJWTToken();

    const options = {
        expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 Days
        httpOnly: true,
        // secure: true,
        sameSite: 'none'
    }
    
    //1-cookie name  2-scret-token (given by jwt.sign) 3-options
    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        message,
        user
    });
}
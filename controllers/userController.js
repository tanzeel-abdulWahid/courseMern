import asyncHandler from "express-async-handler";
import { User } from "../models/User.js"
import { sendEmail } from "../utils/sendEmail.js";
import { sendToken } from "../utils/sendToken.js";
import crypto from "crypto";

export const getAllUsers = (req, res, next) => {
    res.send("User controller")
}

//! Register API
export const register = asyncHandler( async (req, res) => {
    const {name, email, password} = req.body;

    // const file = req.file
    if (!name || !email || !password) return res.status(400).json({message: "Please enter all fields"})

    let user = await User.findOne({email});
    if (user) return res.status(409).json({message: "User already exists"})

    //Upload files on cloudinary


    user = await User.create({
        name,
        email,
        password,
        avatar:{
            public_id:"tempID",
            url:"tempurl"
        },
    });

    //201 status code == new resource created after a post req.
    sendToken(res, user, "registered Successful", 201)
});

//! Login Api
export const login = asyncHandler( async (req, res) => {
    const { email, password} = req.body;

    // const file = req.file
    if (!email || !password) return res.status(400).json({message: "Please enter all fields"})

    const user = await User.findOne({ email }).select("+password");

    if (!user) return res.status(401).json({message: "invalid credentials"})

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({message: "invalid credentials"})

    // 200 means req successfully fulflilled
    sendToken(res, user, "welcome back", 200)
});

//! Logout Api
export const logout = asyncHandler(async (req,res) => {
    res.status(200).cookie("token", '',{
        expires: new Date(Date.now()),
        httpOnly: true
    }).json({
        success: true,
        message:"Logged out successfully"
    })
})


//! Get My profile
export const getMyProfile = asyncHandler(async (req,res) => {
    // ! console.log("GET MY PROFILE",req.user) (getting from middleware) 
    const user = await User.findById(req.user._id)

    res.status(200).json({
        success: true,
        user
    })
})


//! Change password
export const changePassword = asyncHandler(async (req,res) => {

    const {oldPassword, newPassword} = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({message: "Please enter all fields"})
    
    const user = await User.findById(req.user._id).select("+password")

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return res.status(401).json({success: false,message: "invalid credentials"})

    user.password = newPassword

    await user.save()

    res.status(200).json({
        success: true,
        message:"Password changed successfully"
    })
})


//! Update Profile
export const updateProfile = asyncHandler(async (req,res) => {

    const {name,email} = req.body;
    const user = await User.findById(req.user._id).select("+password")

    if(name) user.name = name
    if(email) user.email = email

    await user.save();

    res.status(200).json({
        success: true,
        message:"Profile updated successfully"
    })
})

//!update Profile Pic
//TODO
export const updateProfilePic = asyncHandler(async(req,res) => {
    res.status(200).json({
        success:true,
        message:"Profile Pic updated "
    })
})

//! forgetPassword
export const forgetPassword = asyncHandler(async(req,res) => {

    const {email} = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({message: "User Not Found"})

    const resetToken = await user.getResetToken();
    // console.log("RESET TOKEN", resetToken)
    await user.save();
    //send Token via email
    const url = `${process.env.FRONTEND_URL}/resettoken/${resetToken}`;
    const message = `Click on the link to reset to your password. ${url}. If you have not requested then please ignore`

    await sendEmail(user.email, "Course Bundler Reset Password", message)

    res.status(200).json({
        success:true,
        message:`Reset Token sent to ${user.email}`
    })
})

//!resetPassword
export const resetPassword = asyncHandler(async(req,res) => {

    //* this is the token we sent on forgetPassword controller
    const {token} = req.params;

    //*comparing this token with the token in db.
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{
            $gt: Date.now(),
        }
    })
    console.log(user)

    if (!user) return res.status(400).json({message: "Token is invalid or expired"})
    //*Update password
    user.password = req.body.password;
    user.resetPasswordExpire=undefined;
    user.resetPasswordToken=undefined;
    user.save()

    res.status(200).json({
        success:true,
        message:"Password Changed Successfully",
    })
})
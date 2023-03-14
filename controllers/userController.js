import asyncHandler from "express-async-handler";
import { User } from "../models/User.js"
import { sendToken } from "../utils/sendToken.js";

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
    //send Token via email
    console.log("RESET TOKEN", resetToken)

    res.status(200).json({
        success:true,
        message:`Reset Token sent to ${user.email}`
    })
})

//!resetPassword
export const resetPassword = asyncHandler(async(req,res) => {
    res.status(200).json({
        success:true,
        message:"Profile Pic updated "
    })
})
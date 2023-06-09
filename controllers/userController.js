import asyncHandler from "express-async-handler";
import { User } from "../models/User.js";
import { Course } from "../models/Course.js";
import { sendEmail } from "../utils/sendEmail.js";
import { sendToken } from "../utils/sendToken.js";
import cloudinary from 'cloudinary';
import crypto from "crypto";
import getDataUri from "../utils/dataUri.js";

//! Register API
export const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    // File well recieve from frntend
    const file = req.file;
    if (!name || !email || !password || !file) return res.status(400).json({ message: "Please enter all fields" })

    let user = await User.findOne({ email });
    if (user) return res.status(409).json({ message: "User already exists" })

    //Upload files on cloudinary

    // console.log("file", file);
    const fileUri = getDataUri(file);
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

    user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        },
    });

    //201 status code == new resource created after a post req.
    sendToken(res, user, "registered Successful", 201)
});

//! Login Api
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // const file = req.file
    if (!email || !password) return res.status(400).json({ message: "Please enter all fields" })

    const user = await User.findOne({ email }).select("+password");

    if (!user) return res.status(401).json({ message: "invalid credentials" })

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "invalid credentials" })

    // 200 means req successfully fulflilled
    sendToken(res, user, "welcome back", 200)
});

//! Logout Api
export const logout = asyncHandler(async (req, res) => {
    res.status(200).cookie("token", '', {
        expires: new Date(Date.now()),
        httpOnly: true
    }).json({
        success: true,
        message: "Logged out successfully"
    })
})


//! Get My profile
export const getMyProfile = asyncHandler(async (req, res) => {
    // ! console.log("GET MY PROFILE",req.user) (getting from middleware) 
    const user = await User.findById(req.user._id)

    res.status(200).json({
        success: true,
        user
    })
})


//! Change password
export const changePassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ message: "Please enter all fields" })

    const user = await User.findById(req.user._id).select("+password")

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return res.status(401).json({ success: false, message: "invalid credentials" })

    user.password = newPassword

    await user.save()

    res.status(200).json({
        success: true,
        message: "Password changed successfully"
    })
})


//! Update Profile
export const updateProfile = asyncHandler(async (req, res) => {

    const { name, email } = req.body;
    const user = await User.findById(req.user._id).select("+password")

    if (name) user.name = name
    if (email) user.email = email

    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile updated successfully"
    })
})

//!update Profile Pic
//TODO
export const updateProfilePic = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    const file = req.file;
    // console.log("file", file);
    const fileUri = getDataUri(file);
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

    //Deleting old photo from cloudinary
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    user.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile Pic updated "
    })
})

//! forgetPassword
export const forgetPassword = asyncHandler(async (req, res) => {

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User Not Found" })

    const resetToken = await user.getResetToken();
    // console.log("RESET TOKEN", resetToken)
    await user.save();
    //send Token via email
    const url = `${process.env.FRONTEND_URL}/resettoken/${resetToken}`;
    const message = `Click on the link to reset to your password. ${url}. If you have not requested then please ignore`

    await sendEmail(user.email, "Course Bundler Reset Password", message)

    res.status(200).json({
        success: true,
        message: `Reset Token sent to ${user.email}`
    })
})

//!resetPassword
export const resetPassword = asyncHandler(async (req, res) => {

    //* this is the token we sent on forgetPassword controller
    const { token } = req.params;

    //*comparing this token with the token in db.
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {
            $gt: Date.now(),
        }
    })
    console.log(user)

    if (!user) return res.status(400).json({ message: "Token is invalid or expired" })
    //*Update password
    user.password = req.body.password;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;
    await user.save()

    res.status(200).json({
        success: true,
        message: "Password Changed Successfully",
    })
})

//! add to playlist
export const addToPlaylist = asyncHandler(async (req, res) => {
    //* getting this from middleware
    const user = await User.findById(req.user._id);

    const course = await Course.findById(req.body.id);
    if (!course) return res.status(404).json({ message: "Invalid course ID" })

    //* Checking if course already exists in Users playlist
    const playlistExists = user.playlist.find((item) => {
        if (item.course.toString() === course._id.toString()) return true
    })
    if (playlistExists) return res.status(409).json({ message: "Course already exists in playlist" })

    user.playlist.push({
        course: course._id,
        poster: course.poster.url,
    });

    await user.save();

    res.status(200).json({
        success: true,
        message: "Added to playlist",
    })
})

export const removeFromPlaylist = asyncHandler(async (req, res) => {
    //* getting this from middleware
    const user = await User.findById(req.user._id);

    const course = await Course.findById(req.query.id);
    if (!course) return res.status(404).json({ message: "Invalid course ID" })

    const newPlaylist = user.playlist.filter((item) => {
        if (item.course.toString() !== course._id.toString()) return item;
    })
    user.playlist = newPlaylist;
    await user.save();

    res.status(200).json({
        success: true,
        message: "removed from playlist",
    })
})


//*  Admin Controller
export const getAllUsers = asyncHandler(async (req, res) => {

    const users = await User.find({})

    res.status(200).json({
        success: true,
        users
    })
})

//*  updateUserRole Controller
export const updateUserRole = asyncHandler(async (req, res) => {

    const user = await User.findById(req.params.id);
    // console.log("USER ",user)

    if (!user) return res.status(404).json({ message: "User not found" })
    if (user.role === "user") user.role = "admin"
    else user.role = "user"

    await user.save();

    res.status(200).json({
        success: true,
        message:"Role updated"
    })
})


//*  delete Controller (for admin)
export const deleteUser = asyncHandler(async (req, res) => {

    const user = await User.findById(req.params.id);
    // console.log("USER ",user)

    if (!user) return res.status(404).json({ message: "User not found" })

    await cloudinary.v2.uploader.destroy(user.avatar.public_id)

    //Cancel subscription

    await user.remove();

    res.status(200).json({
        success: true,
        message:"User deleted Successfully"
    })
})



//*  delete my profile (For user)
export const deleteMyProfile = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id);
    // console.log("USER ",user)
    await cloudinary.v2.uploader.destroy(user.avatar.public_id)

    //Cancel subscription

    await user.remove();

    //Logout also by clearing cookie when user deletes its profile
    res.status(200).cookie("token",null,{expires: new Date(Date.now())}
    ).json({
        success: true,
        message:"User deleted Successfully"
    })
})

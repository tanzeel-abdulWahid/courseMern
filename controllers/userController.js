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

export const logout = asyncHandler(async (req,res) => {
    res.status(200).cookie("token", null,{
        expires: new Date(Date.now()),
    }).json({
        success: true,
        message:"Logged out successfully"
    })
})
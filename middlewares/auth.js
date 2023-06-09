import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { User } from "../models/User.js";

export const isAuthenticated =  asyncHandler(async (req,res, next) => {

    const {token} = req.cookies;

    if(!token) return res.status(401).json({success: false,message:"Not logged in"})

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // console.log(decoded._id)

    //Well get the user object here and get it in getMyPrifle controller
    req.user = await User.findById(decoded._id)
    // console.log("req.user", req.user)
    next();
}) 

export const authorizeAdmin =  asyncHandler((req,res, next) => {

    //getting user from upper middleware
    console.log("ROLE", req.user.role)
    if(req.user.role !== 'admin') return res.status(403).json({success: false,message:`${req.user.role} is not allowed to access this resource`})
    next();
}) 
import asyncHandler from "express-async-handler";
import { User } from "../models/User.js"
import { sendToken } from "../utils/sendToken.js";

export const getAllUsers = (req, res, next) => {
    res.send("User controller")
}

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

    sendToken(res, user, "registered Successful", 201)
});

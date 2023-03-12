import { Course } from "../models/Course.js"
import asyncHandler from "express-async-handler";

export const getAllCourses = asyncHandler( async (req, res) => {
        const courses = await Course.find().select("-lectures");
        res.status(200).json({
            success:true,
            courses
        })
    
});


export const createCourse = asyncHandler( async (req, res) => {

    const {title,description, category, createdBy} = req.body;

    // File well recieve from frntend
    const file = req.file;

    if (!title || !description || !category || !createdBy) return res.status(400).json({message: "All fields are required"})
        

    await Course.create({
        title,
        description,
        category,
        createdBy,
        poster:{
            public_id:"temp",
            url:"temp"
        }
    });

    res.status(201).json({
        success:true,
        message:"Course created! add Lectures"
    })

})
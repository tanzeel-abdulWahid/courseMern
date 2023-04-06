import { Course } from "../models/Course.js"
import asyncHandler from "express-async-handler";
import getDataUri from "../utils/dataUri.js";
import cloudinary from 'cloudinary';

//! get all course
export const getAllCourses = asyncHandler(async (req, res) => {
    const courses = await Course.find().select("-lectures");
    res.status(200).json({
        success: true,
        courses
    })

});

//! Create Course
export const createCourse = asyncHandler(async (req, res) => {

    const { title, description, category, createdBy } = req.body;
    if (!title || !description || !category || !createdBy) return res.status(400).json({ message: "All fields are required" })

    // File well recieve from frntend
    const file = req.file;
    // console.log("file", file);
    const fileUri = getDataUri(file);
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);


    await Course.create({
        title,
        description,
        category,
        createdBy,
        poster: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        }
    });

    res.status(201).json({
        success: true,
        message: "Course created! add Lectures"
    })

})

//! get course lectures
export const getCourseLectures = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" })

    course.views += 1;

    await course.save();

    res.status(200).json({
        success: true,
        lectures: course.lectures
    })

});


//! add course lectures
export const addLectures = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { title, description } = req.body
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" })

    //upload file here
    const file = req.file;
    const fileUri = getDataUri(file);
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content,
        //To upload only video
        { resource_type: 'video' }
    );


    course.lectures.push({
        title, description, video: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        }
    })

    course.numOfVideos = course.lectures.length;
    await course.save();

    res.status(200).json({
        success: true,
        message: "Lecture added in course"
    })

});

//! delete Course
export const deleteCourse = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" })

    await cloudinary.v2.uploader.destroy(course.poster.public_id);

    for (let i = 0; i < course.lectures.length; i++) {
        const singleLec = course.lectures[i];
        console.log("vid", singleLec.video.public_id)
        await cloudinary.v2.uploader.destroy(singleLec.video.public_id,
            //Necessary to remive video
            { resource_type: 'video' });
    }

    await course.remove()

    res.status(200).json({
        success: true,
        message: "Course deleted Successfully"
    })

})


//! delete lecture
export const deleteLecture = asyncHandler(async (req, res) => {

    const { courseId, lectureId } = req.query;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" })

    const lecture = course.lectures.find((item) => {
        if (item._id.toString() === lectureId.toString()) return true
    });

    await cloudinary.v2.uploader.destroy(lecture.video.public_id,
        { resource_type: 'video' })

    course.lectures = course.lectures.filter((item) => {
        if (item._id.toString() != lectureId.toString()) return true
    })
    
    course.numOfVideos = course.lectures.length;
    await course.save();

    res.status(200).json({
        success: true,
        message: "lecture deleted Successfully"
    })

})
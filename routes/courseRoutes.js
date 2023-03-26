import express from 'express';
import { addLectures, createCourse, deleteCourse, deleteLecture, getAllCourses, getCourseLectures } from '../controllers/courseController.js';
import { authorizeAdmin, isAuthenticated } from '../middlewares/auth.js';
import singleUpload from '../middlewares/multer.js';

const router = express.Router();

// Get all courses without lectures
router.route("/courses").get(getAllCourses);

//create course only by admin
router.route("/createCourse").post(isAuthenticated,authorizeAdmin ,singleUpload ,createCourse);

//Add lectures, delete course.etc
router.route("/course/:id")
    .get(isAuthenticated,getCourseLectures)
    .post(isAuthenticated,authorizeAdmin,singleUpload ,addLectures)
    .delete(isAuthenticated, authorizeAdmin, deleteCourse)

router.route("/deleteLecture").delete(isAuthenticated,authorizeAdmin, deleteLecture);


export default router;
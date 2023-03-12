import express from 'express';
import { createCourse, getAllCourses } from '../controllers/courseController.js';

const router = express.Router();

// Get all courses without lectures
router.route("/courses").get(getAllCourses);

//create course only by admin
router.route("/createCourse").post(createCourse);


export default router;
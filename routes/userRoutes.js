import express from 'express';
import { getAllUsers, register } from '../controllers/userController.js';

const router = express.Router();

router.route("/users").get(getAllUsers)
router.route("/register").post(register)

//Login
//logout
//Get my profile

//Change password
//Update Profile
//Update profile Pic

// Forget password
//reset Password

//Add to playlist
//Remove from playlist


export default router;
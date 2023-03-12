import express from 'express';
import { getAllUsers, login, logout, register } from '../controllers/userController.js';

const router = express.Router();

router.route("/users").get(getAllUsers)
router.route("/register").post(register)

//Login
router.route("/login").post(login)

//logout
router.route("/logout").get(logout)
//Get my profile

//Change password
//Update Profile
//Update profile Pic

// Forget password
//reset Password

//Add to playlist
//Remove from playlist


export default router;
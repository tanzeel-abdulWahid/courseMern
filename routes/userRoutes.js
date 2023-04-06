import express from 'express';
import { addToPlaylist, changePassword, forgetPassword, getAllUsers, getMyProfile, login, logout, register, removeFromPlaylist, resetPassword, updateProfile, updateProfilePic } from '../controllers/userController.js';
import { isAuthenticated } from '../middlewares/auth.js';
import singleUpload from '../middlewares/multer.js';

const router = express.Router();

router.route("/users").get(getAllUsers)
router.route("/register").post(singleUpload ,register)

//Login
router.route("/login").post(login)

//logout
router.route("/logout").get(logout)
//Get my profile
router.route("/me").get( isAuthenticated ,getMyProfile)
//Change password
router.route("/changePassword").put(isAuthenticated,changePassword)
//Update Profile
router.route("/updateProfile").put(isAuthenticated, updateProfile)
//Update profile Pic
router.route("/updateProfilePic").put(isAuthenticated, singleUpload,updateProfilePic)

// Forget password
router.route("/forgetPassword").post(forgetPassword)
//reset Password
router.route("/resetPassword/:token").put(resetPassword)

//Add to playlist
router.route("/addToPlaylist").post(isAuthenticated,addToPlaylist)
//remove from playlist
router.route("/removeFromPlaylist").delete(isAuthenticated,removeFromPlaylist)


//Remove from playlist


export default router;
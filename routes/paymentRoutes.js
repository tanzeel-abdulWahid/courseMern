import express from 'express';
import { isAuthenticated } from '../middlewares/auth.js';
import { buySubscription, getRazorPayKey, paymentVerification } from '../controllers/paymentController.js';


const router = express.Router();

//!Buy subs
router.route("/subscribe").get(isAuthenticated, buySubscription)
router.route("/getRazorPayKey").get(getRazorPayKey);

router.route("/paymentVerification").post(isAuthenticated,paymentVerification);



export default router;
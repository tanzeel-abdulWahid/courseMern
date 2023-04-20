import asyncHandler from "express-async-handler";
import { User } from "../models/User.js";
import {instance} from '../server.js' 
import crypto from "crypto";
import {Payment} from '../models/Payment.js'
export const buySubscription = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user.role === "admin") return res.status(400).json({ message: "Admin can't buy subscription" })
    
    const plan_id = process.env.PLAN_ID || "plan_JuJevkKAcuZdtRO"

    const subscription = await instance.subscriptions.create({
        plan_id,
        customer_notify:1,
        // quantity:5,
        total_count:12
    })

    user.subscription.id = subscription.id;
    user.subscription.status = subscription.status;

    await user.save();
    
    res.status(201).json({
        success: true,
        subscriptionId:subscription.id,
    })
})


export const paymentVerification = asyncHandler(async (req, res) => {
    const {razorpay_signature, razorpay_payment_id, razporpay_subscription_id} = req.body;
    const user = await User.findById(req.user._id);
    
    const subscription_id = user.subscription.id;
    const generated_signature = crypto.createHmac("sha256",process.env.RAZORPAY_API_SECRET).update(razorpay_payment_id+"|"+subscription_id,"utf-8").digest("hex")

    const isAuthentic = generated_signature === razorpay_signature;
    if(!isAuthentic) return res.redirect(`${process.env.FRONTEND_URL}/paymentfailed`)


    await Payment.create({
        razorpay_signature,
        razorpay_payment_id,
        razporpay_subscription_id
    })

    user.subscription.status = "active";
    await user.save();
    
    res.redirect(`${process.env.FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`)
})

export const getRazorPayKey = asyncHandler(async (req, res) => {
    res.status(201).json({
        success: true,
        key:process.env.RAZORPAY_API_KEY
    })
})


import asyncHandler from "express-async-handler";
import { User } from "../models/User.js";
import {instance} from '../server.js' 

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
        subscription
    })
})


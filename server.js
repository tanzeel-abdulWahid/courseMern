import app from "./App.js";
import connectDb from "./config/database.js";
import mongoose from "mongoose";
import cloudinary from 'cloudinary';
connectDb();

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
    api_key: process.env.CLOUDINARY_CLIENT_API,
    api_secret: process.env.CLOUDINARY_CLIENT_SECRET
})

const PORT = process.env.PORT || 3000

// this will be called once the connection is established
mongoose.connection.once('open', () => {
    console.log("Connected to db")
    app.listen(PORT, () => {
            console.log(`Port running at ${PORT}`);
    })
})


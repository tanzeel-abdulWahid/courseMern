import app from "./App.js";
import connectDb from "./config/database.js";
import mongoose from "mongoose";

connectDb();

const PORT = process.env.PORT || 3000

// this will be called once the connection is established
mongoose.connection.once('open', () => {
    console.log("Connected to db")
    app.listen(PORT, () => {
            console.log(`Port running at ${PORT}`);
    })
})


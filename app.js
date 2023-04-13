import express from "express"
import { config } from "dotenv";
import course from "./routes/courseRoutes.js"
import users from "./routes/userRoutes.js"
import payment from "./routes/paymentRoutes.js"
import errorHandler from "./middlewares/Error.js";
import cookieParser from "cookie-parser";
config({
    path: "./config/config.env",
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended:true
}));
app.use(cookieParser())

app.use("/api/v1",course)
app.use("/api/v1",users)
app.use("/api/v1",payment)




export default app;

app.use(errorHandler);
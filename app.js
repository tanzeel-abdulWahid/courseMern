import express from "express"
import { config } from "dotenv";
import course from "./routes/courseRoutes.js"
import users from "./routes/userRoutes.js"
import errorHandler from "./middlewares/Error.js";

config({
    path: "./config/config.env",
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended:true
}));


app.use("/api/v1",course)
app.use("/api/v1",users)



export default app;

app.use(errorHandler);
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "5kb" }));
app.use(express.urlencoded({ limit: "5kb", extended: true }));
app.use(express.static("public"))
app.use(cookieParser())



// route import
import userRouter from "./routes/users.route.js";


// route declaration

app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});
app.use("/api/v1/user", userRouter)



export default app

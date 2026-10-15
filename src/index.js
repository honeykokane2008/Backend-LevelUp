import dotenv from "dotenv"
import express from "express"
import connectDB from "../src/db/index.js"
import dns from "dns";
import { error } from "console";
import app from "./app.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);


dotenv.config({
    path: './.env'
})


connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`server is running at port : ${process.env.PORT}`)
        })
        app.on("error", (error) => {
            console.log("ERRR:", error);
            throw error
        })

    })
    .catch((err) => {
        console.log("Mongodb not connected, error is:", err);
    })





// ; (async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("errror", (error) => {
//             console.log("ERRR: ", error);
//             throw error
//         })

//         app.listen(process.env.PORT, () => {
//             console.log(`App is listening on port ${process.env.PORT}`);
//         })

//     } catch (error) {
//         console.error("ERROR: ", error)
//         throw error
//     }
// })()

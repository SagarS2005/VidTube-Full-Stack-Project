import dotenv from "dotenv"
dotenv.config({
  path: "./.env"
})
import connectDB from "./db/index.js";
import {app} from "./app.js"

import dns from "dns"

dns.setServers(["1.1.1.1", "8.8.8.8"])
connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })

<<<<<<< HEAD
    
=======
    app.get("/", (req, res) => {
    res.json({
        status: "success",
        message: "VidTube Backend API is running 🚀"
      });
    });
>>>>>>> aed844efe5ac288ead643234c9066ee65792e8fe
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})



// import dotenv from "dotenv";
// import connectDB from "./db/index.js";
// import { app } from "./app.js";
// import dns from "dns"

// dns.setServers(["1.1.1.1", "8.8.8.8"])


// dotenv.config({
//     path: "./.env",
//   });
  
//   connectDB()
//     .then(() => {
//         app.listen(process.env.PORT || 8000, () => {
//             console.log(`Server is running at port: ${process.env.PORT}`);
//           });
//         })
//         .catch((err) => {
//             console.log("MongoDB connection failed!", err);
//           });
        
        
        
/*       
import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
import mongoose from "mongoose";
import  {DB_NAME} from "./constants.js"
import express from "express"
import dns from "dns"

dns.setServers(["1.1.1.1", "8.8.8.8"])
  const app = express();

( async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`
    );

    console.log(`\n MongoDB connected! DB HOST: ${connectionInstance.connection.host}`);

    app.on("error",(error)=>{
      console.log("Error : ", error);
      throw new error;
    })
    app.listen(process.env.PORT || 8080 , ()=>{
      console.log(`App is listening on port : ${process.env.PORT}`);
    })
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
})
();

*/

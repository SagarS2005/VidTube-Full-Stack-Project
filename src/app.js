import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express();

app.use(cors({      // allowing access
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))
    // Migddleware Configuration
app.use(express.json({ limit: "16kb" }));    // allowing json files request
app.use(express.urlencoded({ extended: true, limit : "16kb" }));   // allowing url requests
app.use(express.static("public"))   // it tells that to store user information on public folder
app.use(cookieParser())


// routes import
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import likesRouter from "./routes/likes.route.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import healthCheckRouter from "./routes/healthcheck.routes.js";

app.use("/api/v1/healthcheck", healthCheckRouter);
// routes declaration
app.use("/api/v1/users", userRouter)  // api request
app.use("/api/v1/videos", videoRouter)  // api request
app.use("/api/v1/comment", commentRouter)  // api request
app.use("/api/v1/subcription", subscriptionRouter)  // api request
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/likes", likesRouter)
app.use("/api/v1/dashboard", dashboardRouter)

// it look like this : http:/localhost:8080/api/v1/user/register
export { app };

// app.use()  => it is used for middlewares
// app.get() => it is used for routing
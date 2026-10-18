import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .concat(["http://localhost:5173", "http://127.0.0.1:5173"]);

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps, curl, postman)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin) || origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
                return callback(null, true);
            }
            return callback(null, true); // Dev-friendly fallback
        },
        credentials: true
    })
);

// Middleware Configuration
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import likesRouter from "./routes/likes.route.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import healthCheckRouter from "./routes/healthcheck.routes.js";
import tweetRouter from "./routes/tweet.routes.js";

// routes declaration with singular and plural aliases
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/user", userRouter);

app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/video", videoRouter);

app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/comment", commentRouter);

app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/subscription", subscriptionRouter);
app.use("/api/v1/subcription", subscriptionRouter);

app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/playlist", playlistRouter);

app.use("/api/v1/likes", likesRouter);
app.use("/api/v1/like", likesRouter);

app.use("/api/v1/dashboard", dashboardRouter);

app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/tweet", tweetRouter);

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong";
    return res.status(statusCode).json({
        statusCode,
        data: null,
        message,
        success: false,
        errors: err.errors || []
    });
});

export { app };
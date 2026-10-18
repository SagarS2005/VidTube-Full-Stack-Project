import { Router } from "express";
import {
    createTweet,
    getAllTweets,
    getUserTweets,
    updateTweet,
    deleteTweet
} from "../controllers/tweet.controller.js";
import { verifyJWT, optionalVerifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/")
    .get(optionalVerifyJWT, getAllTweets)
    .post(verifyJWT, createTweet);

router.route("/user/:userId")
    .get(optionalVerifyJWT, getUserTweets);

router.route("/:tweetId")
    .patch(verifyJWT, updateTweet)
    .delete(verifyJWT, deleteTweet);

export default router;

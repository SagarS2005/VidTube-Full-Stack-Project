import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
        publishAVideo
    );

// router.route("/").post(
//     (req, res, next) => {
//         upload.fields([
//             { name: "videoFile", maxCount: 1 },
//             { name: "thumbnail", maxCount: 1 },
//         ])(req, res, (err) => {
//             if (err) {
//                 console.log("MULTER ERROR:", err)
//                 return res.status(400).json({ message: err.message })
//             }
//             next()
//         })
//     },
//     publishAVideo
// )

router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router
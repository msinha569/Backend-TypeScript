import { Router } from "express";
import { getAllVideos } from "../controllers/video.controller";
import verifyJWT from "../middlewares/auth.middleware";


const router = Router()

router.route('/').post(verifyJWT,getAllVideos).post()

export default router
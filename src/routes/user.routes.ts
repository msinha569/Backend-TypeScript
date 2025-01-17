import { Router } from "express";
import { multerUpload } from "../middlewares/multer.middleware";
import { changeCurrentPassword, 
    changeProfilePicture, 
    getCurrectUser, 
    getUserChannelDetails, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    registerUser, 
    updateUserDetails 
    } from "../controllers/user.controller";
import verifyJWT from "../middlewares/auth.middleware";


const router = Router()


router.route('/register').post(multerUpload,registerUser)
router.route('/login').post(loginUser)

//protected routes
router.route('/logout').post(verifyJWT, logoutUser)
router.route('/refreshaccesstoken').post(refreshAccessToken)
router.route('/changecurrentpassword').post(verifyJWT, changeCurrentPassword)
router.route('/getcurrentuser').post(verifyJWT, getCurrectUser)
router.route('/updateuserdetails').post(verifyJWT, updateUserDetails)
router.route('/changeuseravatar').post(verifyJWT, multerUpload, changeProfilePicture)
router.route('/channel/:username').post(verifyJWT, getUserChannelDetails)
export default router
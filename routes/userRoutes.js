const express = require("express")
const { authenticateUser, authorizePermission } = require("../middleware/auth")

const { logInUser } = require("../controller/userController/userController")
const { getAllStaff } = require("../controller/adminController/adminStaffController")
const { generateAgoraInfoForUser, updateCallStatus } = require("../controller/userController/userCallController")
const router = express.Router()

router
    .route("/auth/user/login")
    .post(logInUser)

router
    .route("/user/all-angels")
    .get(authenticateUser, authorizePermission("user"), getAllStaff)

router
    .route("/user/call/:staffId")
    .get(authenticateUser, authorizePermission("user"), generateAgoraInfoForUser)

router
    .route("/user/update-call-status/:staffId")
    .put(authenticateUser, authorizePermission("user"), updateCallStatus)

module.exports = router
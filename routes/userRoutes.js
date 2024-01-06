const express = require("express")
const { authenticateUser, authorizePermission } = require("../middleware/auth")

const { logInUser } = require("../controller/userController/userController")
const { getAllStaff } = require("../controller/adminController/adminStaffController")
const { generateAgoraInfoForUser } = require("../controller/userController/userCallController")
const router = express.Router()

router
    .route("/auth/user/login")
    .post(logInUser)

router
    .route("/user/all-staff")
    .get(authenticateUser, authorizePermission("user"), getAllStaff)

router
    .route("/user/call/:userId")
    .get(authenticateUser, authorizePermission("user"), generateAgoraInfoForUser)

module.exports = router
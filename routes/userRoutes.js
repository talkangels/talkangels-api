const express = require("express")
const { authenticateUser, authorizePermission } = require("../middleware/auth")

const { logInUser, getAllAngels, getOneUser } = require("../controller/userController/userController")
const { generateAgoraInfoForUser, updateCallStatus } = require("../controller/userController/userCallController")
const { getAllRecharges, addBallance } = require("../controller/userController/paymantController")
const router = express.Router()

router
    .route("/auth/user/login")
    .post(logInUser)

router
    .route("/user/all-angels")
    .get(authenticateUser, authorizePermission("user"), getAllAngels)

router
    .route("/user/detail/:id")
    .get(authenticateUser, authorizePermission("user"), getOneUser)

router
    .route("/user/call")
    .post(authenticateUser, authorizePermission("user"), generateAgoraInfoForUser)

router
    .route("/user/update-call-status/:staffId")
    .put(authenticateUser, authorizePermission("user"), updateCallStatus)

router
    .route("/user/all-recharge")
    .get(authenticateUser, authorizePermission("user"), getAllRecharges)

router
    .route("/user/add-ballence")
    .post(authenticateUser, authorizePermission("user"), addBallance)

module.exports = router
const express = require("express")
const { authenticateUser, authorizePermission } = require("../middleware/auth")

const { getAllAngels, getOneUser, applyReferralCode, getOneAngel, addReport, deleteUser } = require("../controller/userController/userController")
const { generateAgoraInfoForUser, updateCallStatus } = require("../controller/userController/userCallController")
const { getAllRecharges, addBallance } = require("../controller/userController/paymantController")
const { addRating } = require("../controller/userController/ratingController")
const { logIn } = require("../controller/logInController")

const router = express.Router()

router
    .route("/auth/login")
    .post(logIn)

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

router
    .route("/user/apply-refer-code")
    .post(authenticateUser, authorizePermission("user"), applyReferralCode)

router
    .route("/user/add-rating")
    .post(authenticateUser, authorizePermission("user"), addRating)

router
    .route("/user/angel-detail/:id")
    .get(authenticateUser, authorizePermission("user"), getOneAngel)

router
    .route("/user/add-report")
    .post(authenticateUser, authorizePermission("user"), addReport)

router
    .route("/user/delete/:id")
    .delete(authenticateUser, authorizePermission("user"), deleteUser)

module.exports = router
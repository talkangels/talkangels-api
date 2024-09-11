const express = require("express")
const { authenticateUser, authorizePermission } = require("../middleware/auth")

const { getAllAngels, getOneUser, applyReferralCode, getOneAngel, addReport, deleteUser } = require("../controller/userController/userController")
const { generateAgoraInfoForUser, callRejectNotification } = require("../controller/userController/userCallController")
const { getAllRecharges, ProceedPayment, VerifyPayment, getPaymentHistory, addBalance } = require("../controller/userController/paymantController")
const { addRating } = require("../controller/userController/ratingController")
const { logIn, logout } = require("../controller/logInController")

const router = express.Router()

router.post("/auth/login", logIn)
router.post("/auth/log-out", logout)

router.get("/user/all-angels", getAllAngels)
router.post("/user/call",  generateAgoraInfoForUser)
router.post("/call-reject", authenticateUser, callRejectNotification)

router.get("/user/detail/:id", authenticateUser, authorizePermission("user"), getOneUser)
router.get("/user/all-recharge", authenticateUser, authorizePermission("user"), getAllRecharges)
router.post("/user/apply-refer-code", authenticateUser, authorizePermission("user"), applyReferralCode)
router.post("/user/add-rating", authenticateUser, authorizePermission("user"), addRating)
router.get("/user/angel-detail/:id", authenticateUser, authorizePermission("user"), getOneAngel)
router.post("/user/add-report", authenticateUser, authorizePermission("user"), addReport)
router.delete("/user/delete/:id", authenticateUser, deleteUser)

router.get("/user/create-payment/:user_id",  authenticateUser, authorizePermission("user"), ProceedPayment)
router.get("/user/verify-payment/:order_id", authenticateUser, authorizePermission("user"),  VerifyPayment)
router.post("/user/add-ballence",  authenticateUser, authorizePermission("user"),addBalance)
router.get("/user/all-payment/:id", authenticateUser, authorizePermission("user"), getPaymentHistory)

module.exports = router

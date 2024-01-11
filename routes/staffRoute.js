const express = require("express")
const { authenticateUser, authorizePermission } = require("../middleware/auth")
const { logInStaff, updateActiveStatus } = require("../controller/staffController/staffController")
const { saveCallHistory, getCallHistory } = require("../controller/staffController/listingController")
const { sendWithdrawRequest } = require("../controller/staffController/wirhdrawController")
const { getOneStaff } = require("../controller/adminController/adminStaffController")
const router = express.Router()

router
    .route("/auth/staff/login")
    .post(logInStaff)

router
    .route("/staff/update-active-status/:staffId")
    .put(authenticateUser, authorizePermission("staff"), updateActiveStatus)

router
    .route("/staff/save-call-history")
    .post(saveCallHistory)

router
    .route("/staff/detail/:id")
    .get(authenticateUser, authorizePermission("staff"), getOneStaff)

router
    .route("/staff/call-history/:staffId")
    .get(authenticateUser, authorizePermission("staff"), getCallHistory)

router
    .route("/staff/send-withdraw-request")
    .post(authenticateUser, authorizePermission("staff"), sendWithdrawRequest)

module.exports = router
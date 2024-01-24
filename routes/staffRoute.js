const express = require("express")
const { authenticateUser, authorizePermission } = require("../middleware/auth")
const { updateActiveStatus } = require("../controller/staffController/staffController")
const { saveCallHistory, getCallHistory } = require("../controller/staffController/listingController")
const { sendWithdrawRequest } = require("../controller/staffController/wirhdrawController")
const { getOneStaff } = require("../controller/adminController/adminStaffController")
const { addReport } = require("../controller/userController/userController")
const router = express.Router()

router
    .route("/staff/update-active-status/:staffId")
    .put(authenticateUser, authorizePermission("staff"), updateActiveStatus)

router
    .route("/staff/save-call-history")
    .post(authenticateUser, saveCallHistory)

router
    .route("/staff/detail/:id")
    .get(authenticateUser, authorizePermission("staff"), getOneStaff)

router
    .route("/staff/call-history/:staffId")
    .get(authenticateUser, authorizePermission("staff"), getCallHistory)

router
    .route("/staff/send-withdraw-request")
    .post(authenticateUser, authorizePermission("staff"), sendWithdrawRequest)

router
    .route("/staff/add-report")
    .post(authenticateUser, authorizePermission("staff"), addReport)

module.exports = router
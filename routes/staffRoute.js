const express = require("express")
const { authenticateUser, authorizePermission } = require("../middleware/auth")
const { logInStaff, updateActiveStatus } = require("../controller/staffController/staffController")
const { saveCallHistory, getCallHistory } = require("../controller/staffController/listingController")
const router = express.Router()

router
    .route("/auth/staff/login")
    .post(logInStaff)

router
    .route("/staff/update-active-status/:staffId")
    .put(authenticateUser, authorizePermission("staff"), updateActiveStatus)

router
    .route("/save-call-history")
    .post(saveCallHistory)

router
    .route("/staff/call-history/:staffId")
    .get(getCallHistory)

module.exports = router
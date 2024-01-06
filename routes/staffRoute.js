const express = require("express")
const { authenticateUser, authorizePermission } = require("../middleware/auth")
const { logInStaff } = require("../controller/staffController/staffController")
const router = express.Router()

router
    .route("/auth/staff/login")
    .post(logInStaff)

module.exports = router
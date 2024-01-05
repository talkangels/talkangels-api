const express = require("express")
const { authenticateUser, authorizePermission } = require("../../middleware/auth")

const { logInUser } = require("../../controller/userController/userController")
const router = express.Router()

router
    .route("/auth/user/login")
    .post(logInUser)

module.exports = router
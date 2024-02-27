const express = require("express")
const { authenticateUser, authorizePermission } = require("../middleware/auth")
const { updateActiveStatus, updateCallStatus } = require("../controller/staffController/staffController")
const { saveCallHistory, getCallHistory } = require("../controller/staffController/listingController")
const { sendWithdrawRequest } = require("../controller/staffController/wirhdrawController")
const { getOneStaff } = require("../controller/adminController/adminStaffController")
const { addReport } = require("../controller/userController/userController")
const router = express.Router()

router.post("/staff/save-call-history", authenticateUser, saveCallHistory)
router.put("/user/update-call-status/:staffId", authenticateUser, updateCallStatus)

router.put("/staff/update-active-status/:staffId", authenticateUser, authorizePermission("staff"), updateActiveStatus)
router.get("/staff/detail/:id", authenticateUser, authorizePermission("staff"), getOneStaff)
router.get("/staff/call-history/:staffId", authenticateUser, authorizePermission("staff"), getCallHistory)
router.post("/staff/send-withdraw-request", authenticateUser, authorizePermission("staff"), sendWithdrawRequest)
router.post("/staff/add-report", authenticateUser, authorizePermission("staff"), addReport)

module.exports = router
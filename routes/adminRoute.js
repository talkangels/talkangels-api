const express = require("express")
const { registerAdmin, loginAdmin, getAdminDetail, updateAdminData, resetPassword, forgotPassword } = require("../controller/adminController/adminController")
const { authenticateUser, authorizePermission } = require("../middleware/auth")
const { addStaff, getAllStaff, getOneStaff, deleteStaff } = require("../controller/adminController/staff/adminStaffController")
const { addRecharges, getAllRecharges, getOneRecharges, updateRecharge, deleteRecharge } = require("../controller/adminController/adminRechargeController")
const { getAllWithdrawRequests, updateWithdrawRequestStatus, getTopRatedStaff, getTotalHoursWorked } = require("../controller/adminController/adminDashbordController")
const { getTotalRatings } = require("../controller/userController/ratingController")
const { getAllReport, updateReportStatus } = require("../controller/adminController/reportController")
const FileUplaodToFirebase = require("../middleware/multerConfig");
const { sendNotifictionUser } = require("../controller/adminController/notificaton")
const { addWePage, getPageData, deletePage, getAllPageNames } = require("../controller/adminController/web/webPageController")
const { getAllUser, updateUserStatus } = require("../controller/adminController/user/userController")

const router = express.Router()

// Admin
router.post("/auth/admin/register", authenticateUser, authorizePermission("admin"), registerAdmin)
router.post("/auth/admin/login", loginAdmin)
router.post("/admin/send-notification/user", authenticateUser, authorizePermission("admin"), sendNotifictionUser)
router.post("/admin/forgot-password", forgotPassword)
router.post("/admin/reset-password", resetPassword)
router.get("/admin/detail/:id", authenticateUser, authorizePermission("admin"), getAdminDetail)
router.put("/admin/update/:id", authenticateUser, authorizePermission("admin"), updateAdminData)

// user
router.get("/admin/all-user", authenticateUser, authorizePermission("admin"), getAllUser)
router.put("/admin/update-user/:id", authenticateUser, authorizePermission("admin"), updateUserStatus)

// Dashbord
router.get("/admin/most-rated", authenticateUser, authorizePermission("admin"), getTopRatedStaff)
router.get("/admin/total-hr", authenticateUser, authorizePermission("admin"), getTotalHoursWorked)

// Report admin routes...
router.get("/admin/all-report", authenticateUser, authorizePermission("admin"), getAllReport)
router.put("/admin/update-report-request/:reportId", authenticateUser, authorizePermission("admin"), updateReportStatus)

// staff admin routes...
router.post("/admin/add-staff", authenticateUser, authorizePermission("admin"), FileUplaodToFirebase.uploadMulter.single("image"), addStaff)
router.get("/admin/all-staff", authenticateUser, authorizePermission("admin"), getAllStaff)
router.get("/admin/one-staff/:id", authenticateUser, authorizePermission("admin"), getOneStaff)
router.get("/admin/all-rating", authenticateUser, authorizePermission("admin"), getTotalRatings)
router.delete("/admin/delete-staff/:id", authenticateUser, authorizePermission("admin"), deleteStaff)

// recharges admin routes...
router.post("/admin/add-recharge", authenticateUser, authorizePermission("admin"), addRecharges)
router.get("/admin/all-recharge", authenticateUser, authorizePermission("admin"), getAllRecharges)
router.get("/admin/one-recharge/:id", authenticateUser, authorizePermission("admin"), getOneRecharges)
router.put("/admin/update-recharge/:id", authenticateUser, authorizePermission("admin"), updateRecharge)
router.delete("/admin/delete-recharge/:id", authenticateUser, authorizePermission("admin"), deleteRecharge)

// withdraw request admin routes...
router.get("/admin/all-withdraw-request", authenticateUser, authorizePermission("admin"), getAllWithdrawRequests)
router.put("/admin/update-withdraw-request", authenticateUser, authorizePermission("admin"), updateWithdrawRequestStatus)

// Web-Page admin routes...
router.post("/admin/add-web-page", authenticateUser, authorizePermission("admin"), addWePage)
router.post("/admin/get-web-page", getPageData)
router.delete("/admin/delete-web-page", authenticateUser, authorizePermission("admin"), deletePage)
router.get("/admin/all-web-page-name", getAllPageNames)

module.exports = router
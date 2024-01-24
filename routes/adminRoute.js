const express = require("express")
const { registerAdmin, loginAdmin, getAllUser, updateUserStatus, getAdminDetail } = require("../controller/adminController/adminController")
const { authenticateUser, authorizePermission } = require("../middleware/auth")
const { addStaff, getAllStaff, getOneStaff, updateStaff, deleteStaff } = require("../controller/adminController/adminStaffController")
const { addRecharges, getAllRecharges, getOneRecharges, updateRecharge, deleteRecharge } = require("../controller/adminController/adminRechargeController")
const { getAllWithdrawRequests, updateWithdrawRequestStatus, updateChargesForAllStaff, getTopRatedStaff } = require("../controller/adminController/adminDashbordController")
const { getTotalRatings } = require("../controller/userController/ratingController")
const { getAllReport, updateReportStatus } = require("../controller/adminController/reportController")
const FileUplaodToFirebase = require("../middleware/multerConfig");

const router = express.Router()

router
    .route("/auth/admin/register")
    .post(registerAdmin)

router
    .route("/auth/admin/login")
    .post(loginAdmin)

router
    .route("/admin/detail/:id")
    .get(authenticateUser, authorizePermission("admin"), getAdminDetail)

router
    .route("/admin/all-user")
    .get(authenticateUser, authorizePermission("admin"), getAllUser)

router
    .route("/admin/update-user/:id")
    .put(authenticateUser, authorizePermission("admin"), updateUserStatus)

router
    .route("/admin/update-charges")
    .post(authenticateUser, authorizePermission("admin"), updateChargesForAllStaff)

router
    .route("/admin/most-rated")
    .get(authenticateUser, authorizePermission("admin"), getTopRatedStaff)


// Report admin routes...
router
    .route("/admin/all-report")
    .get(authenticateUser, authorizePermission("admin"), getAllReport)

router
    .route("/admin/update-report-request/:reportId")
    .put(authenticateUser, authorizePermission("admin"), updateReportStatus)

// staff admin routes...
router
    .route("/admin/add-staff")
    .post(authenticateUser, authorizePermission("admin"), FileUplaodToFirebase.uploadMulter.single("image"), addStaff)

router
    .route("/admin/all-staff")
    .get(authenticateUser, authorizePermission("admin"), getAllStaff)

router
    .route("/admin/one-staff/:id")
    .get(authenticateUser, authorizePermission("admin"), getOneStaff)

router
    .route("/admin/update-staff/:id")
    .put(authenticateUser, authorizePermission("admin"), FileUplaodToFirebase.uploadMulter.single("image"), updateStaff)

router
    .route("/admin/delete-staff/:id")
    .delete(authenticateUser, authorizePermission("admin"), deleteStaff)

router
    .route("/admin/all-rating")
    .get(authenticateUser, authorizePermission("admin"), getTotalRatings)

// recharges admin routes...
router
    .route("/admin/add-recharge")
    .post(authenticateUser, authorizePermission("admin"), addRecharges)

router
    .route("/admin/all-recharge")
    .get(authenticateUser, authorizePermission("admin"), getAllRecharges)

router
    .route("/admin/one-recharge/:id")
    .get(authenticateUser, authorizePermission("admin"), getOneRecharges)

router
    .route("/admin/update-recharge/:id")
    .put(authenticateUser, authorizePermission("admin"), updateRecharge)

router
    .route("/admin/delete-recharge/:id")
    .delete(authenticateUser, authorizePermission("admin"), deleteRecharge)

// withdraw request admin routes...

router
    .route("/admin/all-withdraw-request")
    .get(authenticateUser, authorizePermission("admin"), getAllWithdrawRequests)

router
    .route("/admin/update-withdraw-request")
    .put(authenticateUser, authorizePermission("admin"), updateWithdrawRequestStatus)

module.exports = router
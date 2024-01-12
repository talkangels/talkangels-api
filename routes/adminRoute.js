const express = require("express")
const { registerAdmin, loginAdmin, getAllUser, updateUserStatus } = require("../controller/adminController/adminController")
const { authenticateUser, authorizePermission } = require("../middleware/auth")
const { addStaff, getAllStaff, getOneStaff, updateStaff, deleteStaff } = require("../controller/adminController/adminStaffController")
const { addRecharges, getAllRecharges, getOneRecharges, updateRecharge, deleteRecharge } = require("../controller/adminController/adminRechargeController")
const { getAllWithdrawRequests, updateWithdrawRequestStatus } = require("../controller/adminController/adminRequstController")
const { getTotalRatings } = require("../controller/userController/ratingController")
const router = express.Router()

router
    .route("/auth/admin/register")
    .post(registerAdmin)

router
    .route("/auth/admin/login")
    .post(loginAdmin)

router
    .route("/admin/all-user")
    .get(authenticateUser, authorizePermission("admin"), getAllUser)

router
    .route("/admin/update-user/:id")
    .put(authenticateUser, authorizePermission("admin"), updateUserStatus)

// staff admin routes...
router
    .route("/admin/add-staff")
    .post(authenticateUser, authorizePermission("admin"), addStaff)

router
    .route("/admin/all-staff")
    .get(authenticateUser, authorizePermission("admin"), getAllStaff)

router
    .route("/admin/one-staff/:id")
    .get(authenticateUser, authorizePermission("admin"), getOneStaff)

router
    .route("/admin/update-staff/:id")
    .put(authenticateUser, authorizePermission("admin"), updateStaff)

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
const express = require("express")
const { registerAdmin, loginAdmin } = require("../../controller/adminController/adminController")
const { authenticateUser, authorizePermission } = require("../../middleware/auth")
const { addStaff, getAllStaff, getOneStaff, updateStaff, deleteStaff } = require("../../controller/adminController/adminStaffController")
const router = express.Router()

router
    .route("/auth/admin/register")
    .post(registerAdmin)

router
    .route("/auth/admin/login")
    .post(loginAdmin)

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

module.exports = router
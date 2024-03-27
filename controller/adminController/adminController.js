const { StatusCodes } = require("http-status-codes");
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const ErrorHandler = require("../../middleware/errorHandler");
const Admin = require("../../models/adminModel");
const { generateToken } = require("../../utils/tokenGenerator");
const sendForgotPasswordEmail = require("../../utils/nodemailer");
const { getAllAngelsSocket } = require("../staffController/staffController");
const Staff = require("../../models/staffModel");

const registerAdmin = async (req, res, next) => {
    try {
        const { email, name, password, mobile_number } = req.body;
        if (!email || !password) {
            return next(new ErrorHandler("All fields are required for registration", StatusCodes.BAD_REQUEST));
        }

        const existingUser = await Admin.findOne({ email });
        if (existingUser) {
            return next(new ErrorHandler("Email is already in use", StatusCodes.BAD_REQUEST));
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new Admin({ email, name, password: hashedPassword, mobile_number });
        await admin.save();

        return res.status(StatusCodes.CREATED).json({
            status: StatusCodes.CREATED,
            success: true,
            message: `${admin.role} registered successfully`,
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const loginAdmin = async (req, res, next) => {
    try {
        const { email, password, fcmToken } = req.body;
        if (!email || !password) {
            return next(new ErrorHandler("All fields are required for login", StatusCodes.BAD_REQUEST));
        }

        const user = await Admin.findOne({ email });
        if (!user) {
            return next(new ErrorHandler("Invalid , Please check your email address.", StatusCodes.UNAUTHORIZED));
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            const userWithoutPassword = { ...user.toObject() };
            delete userWithoutPassword.password;

            if (fcmToken) {
                user.fcmToken = fcmToken;
                await user.save();
            }

            const token = generateToken(user);
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                success: true,
                message: `${user.role} logged in successfully`,
                user: userWithoutPassword,
                Token: token
            });
        } else {
            return next(new ErrorHandler("Incorrect Password", StatusCodes.UNAUTHORIZED));
        }
    } catch (error) {
        return next(new ErrorHandler("Authentication failed", StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getAdminDetail = async (req, res, next) => {
    try {
        const adminId = req.params.id;
        const admin = await Admin.findById(adminId).select('-password');
        if (!admin) {
            return next(new ErrorHandler(`Admin not found with id ${adminId}`, StatusCodes.NOT_FOUND));
        }

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            data: admin,
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

const updateAdminData = async (req, res, next) => {
    try {
        const adminId = req.params.id;
        const { email, name, mobile_number, user_charges, staff_charges } = req.body;

        const updatedAdminData = {};
        if (email) updatedAdminData.email = email;
        if (name) updatedAdminData.name = name;
        if (mobile_number) updatedAdminData.mobile_number = mobile_number;
        if (staff_charges) updatedAdminData.staff_charges = staff_charges;
        if (user_charges) updatedAdminData.user_charges = user_charges;

        const updatedAdmin = await Admin.findByIdAndUpdate(
            adminId,
            { $set: updatedAdminData },
            { new: true }
        );

        await Staff.updateMany({}, { $set: { staff_charges: staff_charges, user_charges: user_charges } });

        if (!updatedAdmin) {
            return next(new ErrorHandler(`Admin not found with id ${adminId}`, StatusCodes.NOT_FOUND));
        }
        await getAllAngelsSocket();

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Admin data updated successfully`,
            data: updatedAdmin
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found with this email' });
        }

        const resetToken = Math.random().toString(36).substr(2, 30);
        const resetLink = `https://www.talkangels.com/admin/reset-password?token=${resetToken}`;
        const htmlFormat = fs.readFileSync(path.join(__dirname, '/forgot_password_template.html'), 'utf-8');
        const formattedHtml = htmlFormat.replace('{{resetLink}}', resetLink);

        const success = await sendForgotPasswordEmail({ recipientEmail: email, subject: 'Forgot Password', htmlFormat: formattedHtml });
        if (success) {
            admin.resetToken = resetToken;
            await admin.save();
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                success: true,
                message: "Forgot password email sent successfully",
            });
        } else {
            return res.status(500).json({ status: 500, success: false, message: 'Failed to send forgot password email' });
        }
    } catch (error) {
        return res.status(500).json({ status: 500, success: false, message: 'Failed to send forgot password email' });
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ success: false, message: 'New password is required' });
        }
        if (!token) {
            return res.status(400).json({ success: false, message: 'Token is required' });
        }
        const admin = await Admin.findOne({ resetToken: token });
        if (!admin) {
            return res.status(400).json({ success: false, message: 'Resend the email if the token is invalid or expired' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        admin.password = hashedPassword;
        admin.resetToken = null;
        admin.resetTokenExpiry = null;

        await admin.save();

        return res.status(200).json({ status: 200, success: true, message: 'Password reset successfully' });
    } catch (error) {
        return res.status(500).json({ status: 500, success: false, message: 'Please resend the forgotten password email' });

    }
};

module.exports = {
    registerAdmin,
    loginAdmin,
    getAdminDetail,
    updateAdminData,
    forgotPassword,
    resetPassword
};
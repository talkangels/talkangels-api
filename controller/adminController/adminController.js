const { StatusCodes } = require("http-status-codes");
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const ErrorHandler = require("../../middleware/errorHandler");
const Admin = require("../../models/adminModel");
const { generateToken } = require("../../utils/tokenGenerator");
const User = require("../../models/userModel");
const staffModel = require("../../models/staffModel");
const sendForgotPasswordEmail = require("../../utils/nodemailer");

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
            return next(new ErrorHandler("Authentication failed", StatusCodes.UNAUTHORIZED));
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            const staffs = await staffModel.find();

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
                charges: staffs ? staffs[0].charges : 0,
                Token: token
            });
        } else {
            return next(new ErrorHandler("Authentication failed", StatusCodes.UNAUTHORIZED));
        }
    } catch (error) {
        console.error("Error during login:", error);
        return next(new ErrorHandler("Authentication failed", StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getAllUser = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page_no) || 1;
        const perPage = parseInt(req.query.items_per_page) || 10;
        const { search_text } = req.query;

        const query = search_text ? { $or: [{ name: { $regex: search_text, $options: 'i' } }, { mobile_number: { $regex: search_text, $options: 'i' } }] } : {};
        const skip = (page - 1) * perPage;

        const user = await User.find(query)
            .skip(skip)
            .limit(perPage);

        const totalUsers = await User.countDocuments(query);
        const allUsers = await User.countDocuments()
        const totalPages = Math.ceil(totalUsers / perPage);

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            data: user,
            pagination: {
                total_items: allUsers,
                total_pages: totalPages,
                current_page_item: user.length,
                page_no: parseInt(page),
                items_per_page: parseInt(perPage),
            },
        });

    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const updateUserStatus = async (req, res, next) => {
    try {
        const user_id = req.params.id;
        const {
            status,
        } = req.body;
        const updatedUserData = {
            status,
        };

        const updatedUser = await User.findByIdAndUpdate(
            user_id,
            { $set: updatedUserData },
            { new: true }
        );
        if (!updatedUser) {
            return next(new ErrorHandler(`Staff not found with id ${user_id}`, StatusCodes.NOT_FOUND));
        }

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `User Status updated successfully`,
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
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
        const { email, name, mobile_number } = req.body;

        const updatedAdminData = {};
        if (email) updatedAdminData.email = email;
        if (name) updatedAdminData.name = name;
        if (mobile_number) updatedAdminData.mobile_number = mobile_number;

        const updatedAdmin = await Admin.findByIdAndUpdate(
            adminId,
            { $set: updatedAdminData },
            { new: true }
        );

        if (!updatedAdmin) {
            return next(new ErrorHandler(`Admin not found with id ${adminId}`, StatusCodes.NOT_FOUND));
        }
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

        const resetToken = Math.random().toString(36).substr(2, 15);
        const resetLink = `https://www.talkangels.com/reset-password?token=${resetToken}`;
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
        const admin = await Admin.findOne({ resetToken: token });

        if (!admin) {
            return res.status(400).json({ success: false, message: 'Invalid or expired, resend mail' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        admin.password = hashedPassword;
        admin.resetToken = null;
        admin.resetTokenExpiry = null;

        await admin.save();

        return res.status(200).json({ status: 200, success: true, message: 'Password reset successfully' });
    } catch (error) {
        return res.status(500).json({ status: 500, success: false, message: 'Plese resend mail to forgot password' });

    }
};

module.exports = {
    registerAdmin,
    loginAdmin,
    getAllUser,
    updateUserStatus,
    getAdminDetail,
    updateAdminData,
    forgotPassword,
    resetPassword
};
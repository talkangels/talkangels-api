const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../middleware/errorHandler");
const User = require("../models/userModel");
const { generateToken } = require("../utils/tokenGenerator");
const Staff = require("../models/staffModel");
const Tokens = require("../models/tokenModel");
const { getAllAngelsSocket } = require("./staffController/staffController");
const { generateRandomUsername, generateRandomReferralCode } = require("../utils/helper");

const logIn = async (req, res, next) => {
    try {
        const { name, mobile_number, country_code, fcmToken } = req.body;

        if (!name || !mobile_number) {
            return next(new ErrorHandler("All fields are required for LogIn", StatusCodes.BAD_REQUEST));
        }

        let staff = await Staff.findOne({ mobile_number });
        let user = await User.findOne({ mobile_number });

        if (staff) {
            if (staff.log_out === 1) {
                return next(new ErrorHandler("Please log out from another device.", StatusCodes.UNAUTHORIZED));
            }

            if (fcmToken) {
                staff.fcmToken = fcmToken;
                staff.active_status = 'Online'
                await staff.save();
            }
            staff.log_out = 1;
            await staff.save();

            const token = generateToken(staff);
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                success: true,
                message: `Staff logged in successfully`,
                data: staff,
                role: staff.role,
                Token: token,
            });
        } else if (user) {
            if (user.log_out === 1) {
                return next(new ErrorHandler("Please log out from another device.", StatusCodes.UNAUTHORIZED));
            }

            if (fcmToken) {
                user.fcmToken = fcmToken;
                await user.save();
            }

            user.log_out = 1;
            await user.save();

            const token = generateToken(user);
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                success: true,
                message: `User logged in successfully`,
                data: user,
                role: user.role,
                user_type: "old",
                Token: token,
            });
        } else {
            const user_name = generateRandomUsername();
            const newReferralCode = generateRandomReferralCode();

            user = new User({
                mobile_number,
                user_name,
                name,
                country_code,
                refer_code: newReferralCode
            });
            await user.save();

            if (fcmToken) {
                user.fcmToken = fcmToken;
                await user.save();
            }

            const token = generateToken(user);
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                success: true,
                message: `User logged in successfully`,
                data: user,
                role: user.role,
                user_type: "new",
                Token: token,
            });
        }
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const logout = async (req, res, next) => {
    try {
        const { mobile_number } = req.body;

        if (!mobile_number) {
            return next(new ErrorHandler("Mobile number is required for logout", StatusCodes.BAD_REQUEST));
        }

        const staff = await Staff.findOne({ mobile_number });
        const user = await User.findOne({ mobile_number });

        if (staff) {
            staff.log_out = 0;
            staff.active_status = 'Offline';
            staff.call_status = 'NotAvailable';
            await staff.save();
        } else if (user) {
            user.log_out = 0;
            await user.save();
        } else {
            return next(new ErrorHandler("User not found", StatusCodes.NOT_FOUND));
        }

        await getAllAngelsSocket();

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `User logged out successfully`,
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    logIn,
    logout
}
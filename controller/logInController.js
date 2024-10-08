const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../middleware/errorHandler");
const User = require("../models/userModel");
const { generateToken } = require("../utils/tokenGenerator");
const Staff = require("../models/staffModel");
const { getAllAngelsSocket } = require("./staffController/staffController");
const { generateRandomUsername, generateRandomReferralCode } = require("../utils/helper");
const { checkTokenValidity } = require("../utils/notificationUtils");

const logIn = async (req, res, next) => {
    try {
        console.log("req.body darta ====>",req.body)
        const { name, mobile_number, country_code, fcmToken } = req.body;
        if (!name || !mobile_number) {
            return next(new ErrorHandler("All fields are required for LogIn", StatusCodes.BAD_REQUEST));
        }

        let staff = await Staff.findOne({ mobile_number });
        let user = await User.findOne({ mobile_number });

        if (staff) {
            const existingUser = await User.findOne({ mobile_number });
            if (existingUser) {
                return next(new ErrorHandler("Mobile Number is already in use for a User Account. Please delete this account or use a different number.", StatusCodes.BAD_REQUEST));
            }

            let isTokenValid = true;
            if (staff.fcmToken) {
                isTokenValid = await checkTokenValidity(staff.fcmToken);
            }
            if (isTokenValid === true) {
                if (staff.log_out === 1) {
                    return next(new ErrorHandler("Please log out from another device.", StatusCodes.UNAUTHORIZED));
                }
            }

            staff.fcmToken = fcmToken;
            staff.active_status = 'Online'
            staff.call_status = 'Available'
            staff.log_out = 1;

            const response = await staff.save();
            console.log("store data=======>",response)

            const token = generateToken(staff);
            await getAllAngelsSocket();

            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                success: true,
                message: `Staff logged in successfully`,
                data: staff,
                role: staff.role,
                Token: token,
            });

        } else if (user) {
            const existingStaff = await Staff.findOne({ mobile_number });
            if (existingStaff) {
                return next(new ErrorHandler("Mobile Number is already in use for a Staff Account. Please delete this account or use a different number.", StatusCodes.BAD_REQUEST));
            }

            let isTokenValid = true;
            if (user.fcmToken) {
                isTokenValid = await checkTokenValidity(user.fcmToken);
            }

            if (isTokenValid === true) {
                if (user.log_out === 1) {
                    return next(new ErrorHandler("Please log out from another device.", StatusCodes.UNAUTHORIZED));
                }
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
const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../middleware/errorHandler");
const User = require("../models/userModel");
const { generateToken } = require("../utils/tokenGenerator");
const Staff = require("../models/staffModel");
const Tokens = require("../models/tokenModel");

const logIn = async (req, res, next) => {
    try {
        const { name, mobile_number, country_code, fcmToken } = req.body;
        const deviceIdentifier = req.headers['user-agent'];

        if (!name || !mobile_number) {
            return next(new ErrorHandler("All fields are required for LogIn", StatusCodes.BAD_REQUEST));
        }

        let staff = await Staff.findOne({ mobile_number });
        let user = await User.findOne({ mobile_number });

        if (staff) {
            if (fcmToken) {
                staff.fcmToken = fcmToken;
                staff.active_status = 'Online'
                await staff.save();
            }

            const existingToken = await Tokens.findOne({ mobile_number: staff.mobile_number });

            if (existingToken) {
                return next(new ErrorHandler("Please log out from another device.", StatusCodes.UNAUTHORIZED));
            }

            const token = generateToken(staff, deviceIdentifier);
            await Tokens.create({ mobile_number: staff.mobile_number, token, device: deviceIdentifier });

            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                success: true,
                message: `Staff logged in successfully`,
                data: staff,
                role: staff.role,
                Token: token,
            });
        } else if (user) {
            const existingToken = await Tokens.findOne({ mobile_number: user.mobile_number });

            if (existingToken) {
                return next(new ErrorHandler("Please log out from another device.", StatusCodes.UNAUTHORIZED));
            }

            const token = generateToken(user, deviceIdentifier);
            await Tokens.create({ mobile_number: user.mobile_number, token, device: deviceIdentifier });

            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                success: true,
                message: `User logged in successfully`,
                data: user,
                role: user.role,
                user_type: "new",
                Token: token,
            });
        } else {
            const newReferralCode = generateRandomReferralCode();
            user = new User({
                mobile_number,
                name,
                country_code,
                refer_code: newReferralCode
            });
            await user.save();

            if (fcmToken) {
                user.fcmToken = fcmToken;
                await user.save();
            }

            const token = generateToken(user, deviceIdentifier);
            await Tokens.create({ mobile_number: user.mobile_number, token, device: deviceIdentifier });

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

const generateRandomReferralCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const codeLength = 8;
    let referralCode = '';

    for (let i = 0; i < codeLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        referralCode += characters.charAt(randomIndex);
    }

    return referralCode;
};

const logout = async (req, res, next) => {
    try {
        const { mobile_number } = req.body;

        if (!mobile_number) {
            return next(new ErrorHandler("Mobile number is required for logout", StatusCodes.BAD_REQUEST));
        }

        await Tokens.findOneAndDelete({ mobile_number });

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
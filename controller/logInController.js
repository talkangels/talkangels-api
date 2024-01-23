const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../middleware/errorHandler");
const User = require("../models/userModel");
const { generateToken } = require("../utils/tokenGenerator");
const Staff = require("../models/staffModel");

const logIn = async (req, res, next) => {
    try {
        const { name, mobile_number, country_code, fcmToken } = req.body;

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
            const token = generateToken(staff);
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                success: true,
                message: `Staff logged in successfully`,
                data: staff,
                role: staff.role,
                Token: token,
            });
        } else {
            if (!user) {
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
            } else {
                if (user.status === 0) {
                    return next(new ErrorHandler(`'${mobile_number}' this number is blocked`, StatusCodes.BAD_REQUEST));
                }
                if (fcmToken) {
                    user.fcmToken = fcmToken;
                    await user.save();
                }
                user.refer_code_status = 1
                const token = generateToken(user);
                return res.status(StatusCodes.OK).json({
                    status: StatusCodes.OK,
                    success: true,
                    message: `User logged in successfully`,
                    data: user,
                    user_type: "old",
                    role: user.role,
                    Token: token,
                });
            }
        }
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}
module.exports = {
    logIn
}
const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../middleware/errorHandler");
const Staff = require("../../models/staffModel");
const { generateToken } = require("../../utils/tokenGenerator");

const logInStaff = async (req, res, next) => {
    try {
        const { name, mobile_number, fcmToken } = req.body;

        if (!name || !mobile_number) {
            return next(new ErrorHandler("All fields are required for LogIn", StatusCodes.BAD_REQUEST));
        }

        let staff = await Staff.findOne({ mobile_number });

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
                message: `Logged in successfully`,
                data: staff,
                Token: token,
            });
        } else {
            return next(new ErrorHandler("Authentication failed", StatusCodes.UNAUTHORIZED));
        }
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

module.exports = {
    logInStaff
};
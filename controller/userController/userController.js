const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../middleware/errorHandler");
const User = require("../../models/userModel/userModel");
const { generateToken } = require("../../utils/tokenGenerator");

const logInUser = async (req, res, next) => {
    try {
        const { name, mobile_number, whatsApp_token } = req.body;

        if (!name || !mobile_number) {
            return next(new ErrorHandler("All fields are required for LogIn", StatusCodes.BAD_REQUEST));
        }

        let user = await User.findOne({ mobile_number });

        if (!user) {
            user = new User({
                mobile_number,
                name,
                whatsApp_token
            });
            await user.save();

            const token = generateToken(user);
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                success: true,
                message: `User logged in successfully`,
                data: user,
                Token: token,                       
            });
        } else {
            const token = generateToken(user);
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                success: true,
                message: `User logged in successfully`,
                data: user,
                Token: token,
            });
        }
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

module.exports = {
    logInUser
};
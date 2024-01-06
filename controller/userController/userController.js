const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../middleware/errorHandler");
const User = require("../../models/userModel");
const { generateToken } = require("../../utils/tokenGenerator");
const { generateAgoraInfo } = require("../../utils/agoraService");

const logInUser = async (req, res, next) => {
    try {
        const { name, mobile_number, fcmToken } = req.body;

        if (!name || !mobile_number) {
            return next(new ErrorHandler("All fields are required for LogIn", StatusCodes.BAD_REQUEST));
        }

        let user = await User.findOne({ mobile_number });

        if (!user) {
            user = new User({
                mobile_number,
                name
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
                Token: token,
            });
        } else {
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
                Token: token,
            });
        }
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

const generateAgoraInfoForUser = async (req, res, next) => {
    try {
        const { userId } = req.params; // Assuming you pass the userId in the request parameters

        const user = await User.findById(userId);

        if (!user) {
            return next(new ErrorHandler("User not found", StatusCodes.NOT_FOUND));
        }

        const { channelName, token } = generateAgoraInfo(user);

        user.agora_call = {
            channelName,
            token,
        };

        await user.save();

        const userToken = generateToken(user);
        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Agora info generated successfully for user`,
            data: {
                name: user.name,
                mobile_number: user.mobile_number
            },
            Token: userToken,
            agoraInfo: { channelName, token },
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}


module.exports = {
    logInUser
};
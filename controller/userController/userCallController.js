const ErrorHandler = require('../../middleware/errorHandler');
const { StatusCodes } = require('http-status-codes');
const User = require("../../models/userModel");
const { generateAgoraInfo } = require('../../utils/agoraService');

const generateAgoraInfoForUser = async (req, res, next) => {
    try {
        const { userId } = req.params; // Assuming you pass the userId in the request parameters

        const user = await User.findById(userId);

        if (!user) {
            return next(new ErrorHandler("User not found", StatusCodes.NOT_FOUND));
        }

        const channelName = generateUniqueChannelName(user.name, user.mobile_number);
        const token = generateAgoraInfo(channelName);

        user.agora_call = {
            channelName,
            token,
        };

        await user.save();

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Agora info generated successfully for user`,
            data: {
                name: user.name,
                mobile_number: user.mobile_number
            },
            agoraInfo: { channelName, token, appId: '0bffcb3b97ff4f58bf0d7ca8d92b6b5d' },
        });

    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

function generateUniqueChannelName(name, mobileNumber) {
    // Logic to generate a unique channel name based on user-specific details
    return `${name}_${Date.now()}`;
}


module.exports = {
    generateAgoraInfoForUser
};
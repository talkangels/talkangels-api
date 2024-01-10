const admin = require('firebase-admin');
const ErrorHandler = require('../../middleware/errorHandler');
const { StatusCodes } = require('http-status-codes');
const User = require("../../models/userModel");
const { generateAgoraInfo } = require('../../utils/agoraService');
const serviceAccount = require('../../serviceAccountKey.json');
const Staff = require("../../models/staffModel");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const generateAgoraInfoForUser = async (req, res, next) => {
    try {
        const { angel_id, user_id } = req.body;
        if (!angel_id || !user_id) {
            return next(new ErrorHandler("AngelId and UserId are required for Call", StatusCodes.BAD_REQUEST));
        }

        const staff = await Staff.findById(angel_id);
        const user = await User.findById(user_id);

        if (!staff) {
            return next(new ErrorHandler("Angel not found", StatusCodes.NOT_FOUND));
        }

        if (!user) {
            return next(new ErrorHandler("User not found", StatusCodes.NOT_FOUND));
        }

        if (staff.call_status === 'Busy') {
            return next(new ErrorHandler("Angel is now busy. Please try again later.", StatusCodes.NOT_FOUND));
        }

        const channelName = generateUniqueChannelName(staff.name, user.name);
        const token = generateAgoraInfo(channelName);

        if (staff.fcmToken) {
            const userData = {
                _id: user._id.toString(),
                name: user.name,
                mobile_number: user.mobile_number.toString(),
                image: user.image,
                channelName: channelName,
                agora_token: token.agora_token,
                agora_app_id: token.app_id,
            };

            const message = {
                token: staff.fcmToken,
                notification: {
                    title: "incoming call...",
                    body: "hello",
                },
                data: userData
            };
            const response = await admin.messaging().send(message);
        }

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Call generated successfully`,
            data: {
                angel_name: staff.name,
                agoraInfo: { channelName, token },
            },
        });

    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

function generateUniqueChannelName(staff_name, user_name) {
    return `${staff_name}_${Date.now()}_${user_name}`;
}

const updateCallStatus = async (req, res, next) => {
    try {
        const { staffId } = req.params;
        const { call_status } = req.body;

        const staff = await Staff.findById(staffId);

        if (!staff) {
            return next(new ErrorHandler("Staff not found", StatusCodes.NOT_FOUND));
        }

        if (staff.active_status === "Offline") {
            return next(new ErrorHandler("Please do not update the call status. Angel is offline.", StatusCodes.BAD_REQUEST));
        }

        if (!["Available", "Busy"].includes(call_status)) {
            return next(new ErrorHandler("Invalid call_status", StatusCodes.BAD_REQUEST));
        }

        if (staff.call_status === "Available" && call_status === "Busy") {
            staff.call_status = call_status;
        } else if (staff.call_status === "Busy" && call_status === "Available") {
            staff.call_status = call_status;
        } else {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.BAD_REQUEST,
                success: false,
                message: "Invalid call status transition",
            });
        }
        await staff.save();

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Call status updated successfully for staff`,
            data: {
                name: staff.name,
                mobile_number: staff.mobile_number,
                callStatus: staff.call_status,
            },
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    generateAgoraInfoForUser,
    updateCallStatus
};
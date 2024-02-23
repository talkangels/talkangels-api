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

        if (user.talk_angel_wallet.total_ballance < 1) {
            return next(new ErrorHandler("Insufficient balance. Please recharge your account.", StatusCodes.NOT_FOUND));
        }

        if (staff.call_status === 'Busy') {
            return next(new ErrorHandler("Angel is now busy. Please try again later.", StatusCodes.NOT_FOUND));
        }

        const channelName = generateUniqueChannelName(staff.user_id, user.name);
        const token = generateAgoraInfo(channelName);

        if (staff.fcmToken) {
            const userData = {
                _id: user._id.toString(),
                name: user.name,
                user_id: user.user_id,
                mobile_number: user.mobile_number.toString(),
                image: user.image,
                channelName: channelName,
                agora_token: token.agora_token,
                agora_app_id: token.app_id,
                call_type: "calling",
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
};

function generateUniqueChannelName(staff_name, user_name) {
    return `${staff_name}_${Date.now()}_${user_name}`;
}

const callRejectNotification = async (req, res, next) => {
    try {
        const { angel_id, user_id, type } = req.body;
        if (!angel_id || !user_id || !type) {
            return next(new ErrorHandler("AngelId and UserId are required for reject Call", StatusCodes.BAD_REQUEST));
        }

        const staff = await Staff.findById(angel_id);
        const user = await User.findById(user_id);

        if (!staff) {
            return next(new ErrorHandler("Angel not found", StatusCodes.NOT_FOUND));
        }

        if (!user) {
            return next(new ErrorHandler("User not found", StatusCodes.NOT_FOUND));
        }

        if (type === 'user') {
            if (user.fcmToken) {
                const userData = {
                    _id: staff._id.toString(),
                    name: staff.name,
                    mobile_number: staff.mobile_number.toString(),
                    image: staff.image,
                    call_type: "reject",
                };

                const message = {
                    token: user.fcmToken,
                    notification: {
                        title: "reject call...",
                        body: "Angel is call rejected",
                    },
                    data: userData
                };
                const response = await admin.messaging().send(message);
                return res.status(StatusCodes.OK).json({
                    status: StatusCodes.OK,
                    success: true,
                    message: `Call End`,
                });
            }
        } else if (type === 'staff') {
            if (staff.fcmToken) {
                const userData = {
                    _id: user._id.toString(),
                    name: user.name,
                    user_id: user.user_id,
                    mobile_number: user.mobile_number.toString(),
                    image: user.image,
                    call_type: "reject",
                };

                const message = {
                    token: staff.fcmToken,
                    notification: {
                        title: "reject call...",
                        body: "User is call rejected",
                    },
                    data: userData
                };
                const response = await admin.messaging().send(message);

                return res.status(StatusCodes.OK).json({
                    status: StatusCodes.OK,
                    success: true,
                    message: `Call End`,
                });
            }
        } else {
            return next(new ErrorHandler('server error', StatusCodes.INTERNAL_SERVER_ERROR));
        }

    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    generateAgoraInfoForUser,
    callRejectNotification
};
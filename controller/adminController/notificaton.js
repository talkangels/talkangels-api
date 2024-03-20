const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../middleware/errorHandler");
const User = require("../../models/userModel");
const { checkTokenValidity, sendNotification } = require("../../utils/notificationUtils");

const sendNotifictionUser = async (req, res, next) => {
    try {
        const { title, body, userIds, angel_id, type } = req.body;
        if (!title || !body || !type) {
            return next(new ErrorHandler("Title, Body and Type are required for notifications", StatusCodes.BAD_REQUEST));
        }

        let users;
        if (!userIds) {
            users = await User.find({});
        } else {
            users = await User.find({ _id: { $in: userIds } });
        }

        const notifications = [];
        for (const user of users) {
            if (user.fcmToken) {
                const data = { angel_id: angel_id || '', type: type, };
                await sendNotification(user.fcmToken, title, body, data);
                notifications.push({ user: user._id, status: "sent" });
            } else {
                notifications.push({ user: user._id, status: "token_missing" });
            }
        }

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: "Notifications sent successfully",
            notifications: notifications
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

module.exports = {
    sendNotifictionUser
}
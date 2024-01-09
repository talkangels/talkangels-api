const ErrorHandler = require('../../middleware/errorHandler');
const { StatusCodes } = require('http-status-codes');
const User = require("../../models/userModel");
const { generateAgoraInfo } = require('../../utils/agoraService');
const serviceAccount = require('../../serviceAccountKey.json');
const Staff = require("../../models/staffModel");

const generateAgoraInfoForUser = async (req, res, next) => {
    try {
        const { staffId } = req.params; // Assuming you pass the staffId in the request parameters

        const staff = await Staff.findById(staffId);

        if (!staff) {
            return next(new ErrorHandler("Angel not found", StatusCodes.NOT_FOUND));
        }

        const channelName = generateUniqueChannelName(staff.name, staff.mobile_number);
        const token = generateAgoraInfo(channelName);

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Agora info generated successfully for user`,
            data: {
                angel_name: staff.name,
                agoraInfo: { channelName, token },
            },
        });

    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

function generateUniqueChannelName(name, mobileNumber) {
    return `${name}_${Date.now()}`;
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
            return next(new ErrorHandler("Please do not update the status; Angel is offline.", StatusCodes.BAD_REQUEST));
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
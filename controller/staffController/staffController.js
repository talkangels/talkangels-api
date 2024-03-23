const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../middleware/errorHandler");
const Staff = require("../../models/staffModel");
const socketManager = require('../../utils/socketManager');

async function getAllAngelsSocket(req, res, next) {
    try {
        const staffs = await Staff.find({ status: 1 })
        const staffData = staffs.map(staffs => ({
            "_id": staffs._id,
            "user_name": staffs.user_name,
            "name": staffs.name,
            "mobile_number": staffs.mobile_number,
            "gender": staffs.gender,
            "bio": staffs.bio,
            "image": staffs.image,
            "language": staffs.language,
            "age": staffs.age,
            "active_status": staffs.active_status,
            "call_status": staffs.call_status,
            "charges": staffs.charges,
            "fcmToken": staffs.fcmToken,
            "country_code": staffs.country_code,
            "total_rating": staffs.total_rating,
            "total_listing": staffs.listing.total_minutes,
            "reviews": staffs.reviews.reduce((allReviews, review) => allReviews.concat(review.user_reviews), []),
        }))

        socketManager.getIo().emit('getAllAngels', { data: staffData });

    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const updateActiveStatus = async (req, res, next) => {
    try {
        const { staffId } = req.params;
        const { active_status } = req.body;

        const staff = await Staff.findById(staffId);

        if (!staff) {
            return next(new ErrorHandler("Staff not found", StatusCodes.NOT_FOUND));
        }

        if (!["Online", "Offline"].includes(active_status)) {
            return next(new ErrorHandler("Invalid active_status", StatusCodes.BAD_REQUEST));
        }

        staff.active_status = active_status;
        await staff.save();

        await getAllAngelsSocket()

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Active status updated successfully for staff`,
            data: {
                name: staff.name,
                mobile_number: staff.mobile_number,
                active_status: staff.active_status,
            },
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const updateCallStatus = async (req, res, next) => {
    try {
        const { staffId } = req.params;
        const { call_status } = req.body;

        const staff = await Staff.findById(staffId);

        if (!staff) {
            return next(new ErrorHandler("Staff not found", StatusCodes.NOT_FOUND));
        }

        if (staff.call_available_status === "0") {
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                success: true,
                message: `Please check Available status`,
                data: {
                    name: staff.name,
                    mobile_number: staff.mobile_number,
                    callStatus: staff.call_status,
                },
            });
        }

        if (!["Available", "Busy", "NotAvailable"].includes(call_status)) {
            return next(new ErrorHandler("Invalid call_status", StatusCodes.BAD_REQUEST));
        }
        staff.call_status = call_status;
        await staff.save();

        await getAllAngelsSocket()

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

const updateCallAvailableStatus = async (req, res, next) => {
    try {
        const { staffId } = req.params;
        const { call_available_status } = req.body;

        const staff = await Staff.findById(staffId);
        if (!staff) {
            return next(new ErrorHandler("Staff not found", StatusCodes.NOT_FOUND));
        }

        if (!["0", "1"].includes(call_available_status)) {
            return next(new ErrorHandler("Invalid call_available_status", StatusCodes.BAD_REQUEST));
        }
        staff.call_available_status = call_available_status;
        await staff.save();

        await getAllAngelsSocket()
        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Call Available status updated successfully for staff`,
            data: {
                name: staff.name,
                mobile_number: staff.mobile_number,
                call_available_status: staff.call_available_status,
            },
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    updateActiveStatus,
    updateCallStatus,
    getAllAngelsSocket,
    updateCallAvailableStatus
};
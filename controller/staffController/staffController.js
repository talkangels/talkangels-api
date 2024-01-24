const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../middleware/errorHandler");
const Staff = require("../../models/staffModel");

const updateActiveStatus = async (req, res, next) => {
    try {
        const { staffId } = req.params;
        const { active_status } = req.body;

        const staff = await Staff.findById(staffId);

        if (!staff) {
            return next(new ErrorHandler("Staff not found", StatusCodes.NOT_FOUND));
        }

        if (staff.call_status === "Busy") {
            return next(new ErrorHandler("Please do not update the active status. Angel is Busy.", StatusCodes.BAD_REQUEST));
        }

        if (!["Online", "Offline"].includes(active_status)) {
            return next(new ErrorHandler("Invalid active_status", StatusCodes.BAD_REQUEST));
        }

        if (staff.active_status === "Online" && active_status === "Offline") {
            staff.active_status = active_status;
        } else if (staff.active_status === "Offline" && active_status === "Online") {
            staff.active_status = active_status;
        } else {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.BAD_REQUEST,
                success: false,
                message: "Invalid Active status transition",
            });
        }
        await staff.save();

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

module.exports = {
    updateActiveStatus
};
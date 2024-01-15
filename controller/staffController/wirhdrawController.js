const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../middleware/errorHandler");
const Withdraws = require("../../models/withdrawModel");
const Staff = require("../../models/staffModel");

const sendWithdrawRequest = async (req, res, next) => {
    try {
        const { staffId, request_amount } = req.body;

        if (!request_amount) {
            return next(new ErrorHandler("Request amount is required", StatusCodes.BAD_REQUEST));
        }

        let staffWithdraw = await Withdraws.findOne({ staff: staffId });

        if (!staffWithdraw) {
            staffWithdraw = new Withdraws({ staff: staffId, request: [] });
        }

        const staff = await Staff.findById(staffId);
        if (!staff) {
            return next(new ErrorHandler("Staff not found", StatusCodes.NOT_FOUND));
        }

        const hasPendingRequests = staffWithdraw.request.some(request => request.request_status === "pending");

        if (hasPendingRequests) {
            return next(new ErrorHandler("There are pending withdrawal requests. Please wait for approval or rejection.", StatusCodes.BAD_REQUEST));
        }

        if (staff.earnings.total_pending_money) {
            if (staff.earnings.total_pending_money < request_amount) {
                return next(new ErrorHandler("Insufficient earnings for withdrawal", StatusCodes.BAD_REQUEST));
            }
        } else {
            if (staff.earnings.current_earnings < request_amount) {
                return next(new ErrorHandler("Insufficient earnings for withdrawal", StatusCodes.BAD_REQUEST));
            }
        }


        staff.earnings.sent_withdraw_request = request_amount;

        const newRequest = {
            request_amount,
            current_amount: staff.earnings.current_earnings,
            pending_amount: staff.earnings.total_pending_money,
            date: new Date(),
            request_status: "pending",
        };

        staffWithdraw.request.push(newRequest);

        await staff.save();
        await staffWithdraw.save();

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: "Withdrawal request sent successfully",
            data: newRequest,
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    sendWithdrawRequest,
};

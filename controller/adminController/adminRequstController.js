const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../middleware/errorHandler");
const Withdraws = require("../../models/withdrawModel");
const Staff = require("../../models/staffModel");

const getAllWithdrawRequests = async (req, res, next) => {
    try {
        const withdrawRequests = await Withdraws.find().populate({
            path: 'staff',
            model: 'Staff',
            select: 'name mobile_number',
        });

        const formattedRequests = [].concat(
            ...withdrawRequests.map(requests =>
                requests.request.map(req => ({
                    _id: req._id,
                    staff_name: requests.staff.name,
                    staff_number: requests.staff.mobile_number,
                    request_amount: req.request_amount,
                    current_amount: req.current_amount,
                    date: req.date,
                    request_status: req.request_status,
                }))
            )
        );

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: "Withdrawal requests retrieved successfully",
            data: formattedRequests,
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};


const updateWithdrawRequestStatus = async (req, res, next) => {
    try {
        const { requestId, status } = req.body;

        if (!requestId || !status) {
            return next(
                new ErrorHandler(
                    "Request ID and status are required for updating withdrawal request status",
                    StatusCodes.BAD_REQUEST
                )
            );
        }
        const withdrawRequest = await Withdraws.findOne({
            "request._id": requestId,
        });
        if (!withdrawRequest) {
            return next(
                new ErrorHandler(
                    "Withdrawal request not found",
                    StatusCodes.NOT_FOUND
                )
            );
        }
        const staffId = withdrawRequest.staff;
        const requestIndex = withdrawRequest.request.findIndex(req => req._id.toString() === requestId);
        if (requestIndex === -1) {
            return next(
                new ErrorHandler(
                    "Withdrawal request not found in the request array",
                    StatusCodes.NOT_FOUND
                )
            );
        }
        const requestToUpdate = withdrawRequest.request[requestIndex];
        if (requestToUpdate.request_status === 'pending') {
            requestToUpdate.request_status = status;
            const staffMember = await Staff.findById(staffId);

            if (status === 'accept') {
                staffMember.earnings.total_money_withdraws += requestToUpdate.request_amount;
                staffMember.earnings.total_pending_money -= requestToUpdate.request_amount;
                staffMember.earnings.sent_withdraw_request = 0;
                await staffMember.save();
            }

            if (status === 'reject') {
                staffMember.earnings.sent_withdraw_request = 0;
                await staffMember.save();
            }

            await withdrawRequest.save();
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                success: true,
                message: `Withdrawal request status updated to ${status} successfully`,
                data: {
                    staff_name: staffMember.name,
                    staff_number: staffMember.mobile_number,
                    request_amount: requestToUpdate.request_amount,
                    pending_money: staffMember.earnings.total_pending_money,
                    date: requestToUpdate.date,
                    request_status: status,
                },
            });
        } else {
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                success: false,
                message: "Withdrawal request status cannot be updated as it is not in 'pending' status",
            });
        }
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    getAllWithdrawRequests,
    updateWithdrawRequestStatus
};
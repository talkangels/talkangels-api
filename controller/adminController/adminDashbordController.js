const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../middleware/errorHandler");
const Withdraws = require("../../models/withdrawModel");
const Staff = require("../../models/staffModel");

const getAllWithdrawRequests = async (req, res, next) => {
    try {
        const startDateParam = req.query.start_date;
        const currentDateIST = new Date(startDateParam).toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const currentDate = new Date(currentDateIST).setHours(0, 0, 0, 0);

        const withdrawRequests = await Withdraws.find().populate({
            path: 'staff',
            model: 'Staff',
            select: 'name mobile_number image',
        });

        const DateRequests = [].concat(
            ...withdrawRequests.map(requests =>
                requests.request.find(req => new Date(req.date).setHours(0, 0, 0, 0) === currentDate)
            )
        ); 

        const formattedRequests = [].concat(
            ...withdrawRequests.map(requests =>
                requests.request.map(req => ({
                    _id: req._id,
                    staff_name: requests.staff?.name || "Not Found",
                    staff_number: requests.staff?.mobile_number || "Not Found",
                    staff_image: requests.staff?.image || "Not Found",
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
            data: startDateParam ? DateRequests : formattedRequests,
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
                staffMember.earnings.withdraw_request_message = `Your withdrawal request of ${requestToUpdate.request_amount} is now approval.`;
                await staffMember.save();
            }

            if (status === 'reject') {
                staffMember.earnings.sent_withdraw_request = 0;
                staffMember.earnings.withdraw_request_message = `Your withdrawal request of ${requestToUpdate.request_amount} is now rejection.`;
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

const getTopRatedStaff = async (req, res, next) => {
    try {
        const mostRatedStaff = await Staff.aggregate([
            {
                $match: { status: 1 },
            },
            {
                $unwind: "$reviews",
            },
            {
                $unwind: "$reviews.user_reviews",
            },
            {
                $group: {
                    _id: { staff_id: "$_id", staff_name: "$name", image: "$image" },
                    mobile_number: { $first: "$mobile_number" },
                    username: { $first: "$user_name" },
                    rating: { $max: "$reviews.user_reviews.rating" },
                },
            },
            {
                $match: { "rating": { $ne: 0 } },
            },
            {
                $sort: { rating: -1 },
            },
            {
                $project: {
                    _id: "$_id.staff_id",
                    staff_name: "$_id.staff_name",
                    image: "$_id.image",
                    mobile_number: 1,
                    username: 1,
                    rating: 1,
                },
            },
            {
                $limit: 3,
            },
        ]);

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            data: mostRatedStaff,
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getTotalHoursWorked = async (req, res, next) => {
    try {
        const totalMinutesWorkedPipeline = [
            {
                $unwind: "$listing.call_history"
            },
            {
                $unwind: "$listing.call_history.history"
            },
            {
                $project: {
                    totalMinutes: {
                        $regexFind: {
                            input: "$listing.call_history.history.minutes",
                            regex: /\d+/
                        }
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalMinutes: {
                        $sum: {
                            $toInt: "$totalMinutes.match"
                        }
                    }
                }
            }
        ];

        // Execute aggregation
        const result = await Staff.aggregate(totalMinutesWorkedPipeline);

        // Calculate total hours and minutes
        const totalMinutes = result.length > 0 ? result[0].totalMinutes : 0;
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            data: {
                total_minutes: {
                    hr: totalHours.toString(),
                    min: remainingMinutes.toString()
                },
                Revenue: "" // You can calculate revenue here if needed
            }
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};


module.exports = {
    getAllWithdrawRequests,
    updateWithdrawRequestStatus,
    getTopRatedStaff,
    getTotalHoursWorked
};
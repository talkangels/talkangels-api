const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../middleware/errorHandler");
const Staff = require("../../models/staffModel");
const User = require("../../models/userModel");

const saveCallHistory = async (req, res, next) => {
    try {
        const { staff_id, user_id, call_type, minutes } = req.body;

        if (!user_id || !call_type || !minutes) {
            return next(new ErrorHandler("User ID, call type, and minutes are required", StatusCodes.BAD_REQUEST));
        }

        const staff = await Staff.findById(staff_id);
        const user = await User.findById(user_id);

        if (!staff) {
            return next(new ErrorHandler("Staff not found", StatusCodes.NOT_FOUND));
        }

        const currentTime = new Date();
        currentTime.setMinutes(currentTime.getMinutes() - minutes);
        const existingUser = staff.listing.call_history.find(entry => entry.user.equals(user_id));
        const formattedMinutes = formatMinutes(minutes);
        if (!existingUser) {
            staff.listing.call_history.push({
                user: user_id, 
                history: [{
                    date: currentTime,
                    call_type,
                    mobile_number: user.mobile_number,
                    minutes: formattedMinutes,
                }],
            });
        } else {
            const existingHistory = existingUser.history.find(entry => entry.date.toString() === currentTime.toString() && entry.call_type === call_type);
            if (!existingHistory) {
                existingUser.history.push({
                    date: currentTime,
                    call_type,
                    mobile_number: user.mobile_number,
                    minutes: formattedMinutes,
                });
            } else {
                return res.status(StatusCodes.OK).json({
                    status: StatusCodes.OK,
                    success: true,
                    message: "Duplicate entry. Skipping.",
                });
            }
        }

        if (minutes !== 0) {
            const chargePerMinute = staff.charges || 10;
            const earnings = calculateEarnings(minutes, chargePerMinute);

            staff.earnings.current_earnings = earnings + staff.earnings.current_earnings;
            staff.earnings.total_pending_money = staff.earnings.total_money_withdraws === 0 ? staff.earnings.current_earnings : staff.earnings.current_earnings - staff.earnings.total_money_withdraws;
            const total_minutes = calculateTotalMinutes(staff.listing.call_history)
            staff.listing.total_minutes = formatMinutes(total_minutes);
        }

        await staff.save();

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: "Call history saved successfully",
            data: {
                name: staff.name,
                mobile_number: staff.mobile_number,
                user_id,
                call_type,
                date: currentTime,
                minutes: formattedMinutes,
            },
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

function formatMinutes(minutes) {
    return `${Math.floor(minutes / 60)}hr:${minutes % 60}min`;
}

function calculateTotalMinutes(callHistory) {
    return callHistory.reduce((total, entry) => {
        return total + entry.history.reduce((entryTotal, historyEntry) => {
            return entryTotal + parseInt(historyEntry.minutes.split(':')[0]) * 60 + parseInt(historyEntry.minutes.split(':')[1]);
        }, 0);
    }, 0);
}

const calculateEarnings = (totalMinutes, chargePerMinute) => {
    return totalMinutes * chargePerMinute;
};

const getCallHistory = async (req, res, next) => {
    try {
        const { staffId } = req.params;

        const staff = await Staff.findById(staffId).populate({
            path: 'listing.call_history.user',
            select: 'name mobile_number image',
        });

        if (!staff) {
            return next(new ErrorHandler("Staff not found", StatusCodes.NOT_FOUND));
        }

        const formattedCallHistory = staff.listing.call_history.map(entry => {
            if (!entry.user) {
                return {
                    user: null,
                    history: entry.history.map(history => ({
                        date: history.date,
                        call_type: history.call_type,
                        minutes: history.minutes,
                        mobile_number: history.mobile_number,
                    })),
                };
            }

            return {
                user: {
                    user_name: entry.user.name,
                    mobile_number: entry.user.mobile_number,
                    image: entry.user.image,
                },
                history: entry.history.map(history => ({
                    date: history.date,
                    call_type: history.call_type,
                    minutes: history.minutes,
                    mobile_number: history.mobile_number,
                })),
            };
        });

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            data: formattedCallHistory,
        });

    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    saveCallHistory,
    getCallHistory
};
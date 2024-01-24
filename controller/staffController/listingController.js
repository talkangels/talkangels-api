const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../middleware/errorHandler");
const Staff = require("../../models/staffModel");
const User = require("../../models/userModel");

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


const saveCallHistory = async (req, res, next) => {
    try {
        const { staff_id, user_id, call_type, seconds } = req.body;

        if (!user_id || !call_type || !seconds) {
            return next(new ErrorHandler("User ID, call type, and seconds are required", StatusCodes.BAD_REQUEST));
        }

        const staff = await Staff.findById(staff_id);
        const user = await User.findById(user_id);

        if (!staff) {
            return next(new ErrorHandler("Staff not found", StatusCodes.NOT_FOUND));
        }

        const currentTime = new Date();
        currentTime.setSeconds(currentTime.getSeconds() - seconds);

        const existingUser = staff.listing.call_history.find(entry => entry.user.equals(user_id));
        const formattedSeconds = formatSeconds(seconds);

        if (!existingUser) {
            staff.listing.call_history.push({
                user: user_id,
                history: [{
                    date: currentTime,
                    call_type,
                    mobile_number: user.mobile_number,
                    minutes: formattedSeconds,
                }],
            });
        } else {
            const existingHistory = existingUser.history.find(entry => entry.date.toString() === currentTime.toString() && entry.call_type === call_type);
            if (!existingHistory) {
                existingUser.history.push({
                    date: currentTime,
                    call_type,
                    mobile_number: user.mobile_number,
                    minutes: formattedSeconds,
                });
            } else {
                return res.status(StatusCodes.OK).json({
                    status: StatusCodes.OK,
                    success: true,
                    message: "Duplicate entry. Skipping.",
                });
            }
        }
        
        if (seconds !== 0) {
            const chargePerMinute = staff.charges || 1;
            const earnings = calculateEarnings(seconds, chargePerMinute);
        
            // Use toFixed(2) to round to two decimal places
            staff.earnings.current_earnings = parseFloat((earnings + staff.earnings.current_earnings).toFixed(2));
            staff.earnings.total_pending_money = parseFloat((staff.earnings.total_money_withdraws === 0 ? staff.earnings.current_earnings : staff.earnings.current_earnings - staff.earnings.total_money_withdraws).toFixed(2));
        
            const totalSeconds = calculateTotalSeconds(staff.listing.call_history);
            staff.listing.total_minutes = formatSeconds(totalSeconds);
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
                minutes: formattedSeconds,
            },
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

function formatSeconds(seconds) {
    const formattedMinutes = `${Math.floor(seconds / 60)}min ${seconds % 60}sec`;
    return formattedMinutes;
}

function calculateTotalSeconds(callHistory) {
    return callHistory.reduce((total, entry) => {
        return total + entry.history.reduce((entryTotal, historyEntry) => {
            const secondsString = historyEntry.minutes || '0min 0sec';
            return entryTotal + parseInt(secondsString.split('min')[0]) * 60 + parseInt(secondsString.split('min ')[1].split('sec')[0]);
        }, 0);
    }, 0);
}


const calculateEarnings = (totalSeconds, chargePerMinute) => {
    const chargePerSecond = chargePerMinute / 60;
    const earnings = totalSeconds * chargePerSecond;
    return parseFloat(earnings.toFixed(2));
};



module.exports = {
    saveCallHistory,
    getCallHistory
};
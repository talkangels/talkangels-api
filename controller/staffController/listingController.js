const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../middleware/errorHandler");
const Staff = require("../../models/staffModel");
const User = require("../../models/userModel");

const getCallHistory = async (req, res, next) => {
    try {
        const { staffId } = req.params;

        const staff = await Staff.findById(staffId).populate({
            path: 'listing.call_history.user',
            select: 'name user_name mobile_number image',
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
                    user_name: entry.user.user_name,
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
        if (!user) {
            return next(new ErrorHandler("User not found", StatusCodes.NOT_FOUND));
        }
        if (!staff) {
            return next(new ErrorHandler("Staff not found", StatusCodes.NOT_FOUND));
        }

        // const currentTime = new Date();
        const currentTime1 = new Date().toLocaleString("en-IN", {timeZone: "Asia/Kolkata"});
        
        // Parse to ensure it's in Date format
        const currentTime = new Date(currentTime1);
        currentTime.setSeconds(currentTime.getSeconds() - seconds);

        const existingStaff = staff.listing.call_history.find(entry => entry.user.equals(user_id));
        const formattedSeconds = formatSecondsin(seconds);

        if (!existingStaff) {
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
            const existingHistory = existingStaff.history.find(entry => entry.date.toString() === currentTime.toString() && entry.call_type === call_type);
            if (!existingHistory) {
                existingStaff.history.push({
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
            staff.earnings.current_earnings = parseFloat((earnings + staff.earnings.current_earnings).toFixed(2));
            staff.earnings.total_pending_money = parseFloat((staff.earnings.total_money_withdraws === 0 ? staff.earnings.current_earnings : staff.earnings.current_earnings - staff.earnings.total_money_withdraws).toFixed(2));

            const totalSeconds = calculateTotalSeconds(staff.listing.call_history);
            staff.listing.total_minutes = formatSeconds(totalSeconds);

            const user_ballance = user.talk_angel_wallet.total_ballance - earnings;
            user.talk_angel_wallet.total_ballance = user_ballance.toFixed(2)
            const userTransaction = {
                amount: earnings,
                payment_id: '0',
                type: 'debited',
                curent_bellance: user.talk_angel_wallet.total_ballance,
                date: currentTime,
            };

            user.talk_angel_wallet.transections.push(userTransaction);
        }

        await staff.save();
        await user.save();

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

function formatSecondsin(seconds) {
    const formattedMinutes = `${Math.floor(seconds / 60)}min ${seconds % 60}sec`;
    return formattedMinutes;
}

function calculateTotalSeconds(callHistory) {
    const totalSeconds = callHistory.reduce((total, entry) => {
        return total + entry.history.reduce((entryTotal, historyEntry) => {
            const secondsString = historyEntry.minutes || '0min 0sec';
            const [minutesPart, secondsPart] = secondsString.split('min ');

            const minutes = parseInt(minutesPart) || 0;
            const seconds = parseInt(secondsPart.split('sec')[0]) || 0;

            return entryTotal + minutes * 60 + seconds;
        }, 0);
    }, 0);

    return isNaN(totalSeconds) ? 0 : totalSeconds;
}

function formatSeconds(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    return `${formattedHours}h:${formattedMinutes}m:${formattedSeconds}s`;
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
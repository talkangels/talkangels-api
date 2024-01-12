const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../middleware/errorHandler");
const User = require("../../models/userModel");
const Recharges = require("../../models/rechargeModel");

const getAllRecharges = async (req, res, next) => {
    try {
        const query = {
            status: 1,
        };

        const recharges = await Recharges.find(query);

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            data: recharges,
        });

    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const addBallance = async (req, res, next) => {
    try {
        const { user_id, amount, payment_id } = req.body;

        if (!user_id || !amount || !payment_id) {
            return next(new ErrorHandler("user_id and amount are required", StatusCodes.BAD_REQUEST));
        }

        const user = await User.findById(user_id);

        if (!user) {
            return next(new ErrorHandler("User not found", StatusCodes.NOT_FOUND));
        }

        user.talk_angel_wallet.transections = user.talk_angel_wallet.transections || [];
        const currentTime = new Date();
        user.talk_angel_wallet.transections.push({
            amount: amount,
            type: 'credit',
            curent_bellance: user.talk_angel_wallet.total_ballance,
            payment_id: payment_id,
            date: currentTime
        });
        user.talk_angel_wallet.total_ballance = (parseFloat(user.talk_angel_wallet.total_ballance) + parseFloat(amount)).toString();

        await user.save();

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: "Balance added successfully",
            data: user.talk_angel_wallet,
        });

    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    getAllRecharges,
    addBallance
};
const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../middleware/errorHandler");
const Recharges = require("../../models/rechargeModel");

const addRecharges = async (req, res, next) => {
    try {
        const { amount, discount_amount, description, status } = req.body;

        if (!amount || !discount_amount) {
            return next(new ErrorHandler("All fields are required for add Recharge", StatusCodes.BAD_REQUEST));
        }

        const recharg = new Recharges({ amount, discount_amount, description, status });
        await recharg.save();

        return res.status(StatusCodes.CREATED).json({
            status: StatusCodes.CREATED,
            success: true,
            message: `Recharge Add successfully`,
        });

    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getAllRecharges = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page_no) || 1;
        const perPage = parseInt(req.query.items_per_page) || 10;

        const skip = (page - 1) * perPage;
        const recharge = await Recharges.find()
            .skip(skip)
            .limit(perPage);

        const allRecharges = await Recharges.countDocuments()

        const totalPages = Math.ceil(allRecharges / perPage);

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            data: recharge,
            pagination: {
                total_items: allRecharges,
                total_pages: totalPages,
                current_page_item: recharge.length,
                page_no: parseInt(page),
                items_per_page: parseInt(perPage),
            },
        });

    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getOneRecharges = async (req, res, next) => {
    try {
        const rechargeId = req.params.id;

        const recharge = await Recharges.findById(rechargeId);

        if (!recharge) {
            return next(new ErrorHandler(`Recharge not found with id ${rechargeId}`, StatusCodes.NOT_FOUND));
        }

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            data: recharge,
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));

    }
};

const updateRecharge = async (req, res, next) => {
    try {
        const rechargeId = req.params.id;

        const {
            amount, discount_amount, description, status
        } = req.body;

        const updatedRechargeData = {
            amount, discount_amount, description, status
        };

        const updatedRecharge = await Recharges.findByIdAndUpdate(
            rechargeId,
            { $set: updatedRechargeData },
            { new: true }
        );

        if (!updatedRecharge) {
            return next(new ErrorHandler(`Recharge not found with id ${rechargeId}`, StatusCodes.NOT_FOUND));
        }

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Recharge updated successfully`,
            data: updatedRecharge,
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const deleteRecharge = async (req, res, next) => {
    try {
        const rechargeId = req.params.id;

        const existingRecharge = await Recharges.findById(rechargeId);

        if (!existingRecharge) {
            return next(new ErrorHandler(`Recharge not found with id ${rechargeId}`, StatusCodes.NOT_FOUND));
        }

        const deletedRecharge = await Recharges.findByIdAndDelete(rechargeId);

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Recharge deleted successfully`,
            data: {
                deletedRecharge,
            },
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    addRecharges,
    getAllRecharges,
    getOneRecharges,
    updateRecharge,
    deleteRecharge
};
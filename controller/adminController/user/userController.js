const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../../middleware/errorHandler");
const User = require("../../../models/userModel");

const getAllUser = async (req, res, next) => {
    try {
        const user = await User.find()
        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            data: user,
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const updateUserStatus = async (req, res, next) => {
    try {
        const user_id = req.params.id;
        const {
            status,
        } = req.body;
        const updatedUserData = {
            status,
        };

        const updatedUser = await User.findByIdAndUpdate(
            user_id,
            { $set: updatedUserData },
            { new: true }
        );
        if (!updatedUser) {
            return next(new ErrorHandler(`Staff not found with id ${user_id}`, StatusCodes.NOT_FOUND));
        }

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `User Status updated successfully`,
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    getAllUser,
    updateUserStatus,
};
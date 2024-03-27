const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../../middleware/errorHandler");
const User = require("../../../models/userModel");

const getAllUser = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page_no) || 1;
        const perPage = parseInt(req.query.items_per_page) || 10;
        const { search_text } = req.query;

        const query = search_text ? { $or: [{ name: { $regex: search_text, $options: 'i' } }, { mobile_number: { $regex: search_text, $options: 'i' } }] } : {};
        const skip = (page - 1) * perPage;

        const user = await User.find(query)
            .skip(skip)
            .limit(perPage);

        const totalUsers = await User.countDocuments(query);
        const allUsers = await User.countDocuments()
        const totalPages = Math.ceil(totalUsers / perPage);

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            data: user,
            pagination: {
                total_items: allUsers,
                total_pages: totalPages,
                current_page_item: user.length,
                page_no: parseInt(page),
                items_per_page: parseInt(perPage),
            },
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
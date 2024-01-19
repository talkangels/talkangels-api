const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../middleware/errorHandler");
const Staff = require("../../models/staffModel");

const addStaff = async (req, res, next) => {
    try {
        const {
            image,
            name,
            mobile_number,
            gender,
            bio,
            user_name,
        } = req.body;

        if (!name || !mobile_number || !gender || !bio || !user_name) {
            return next(new ErrorHandler("All fields are required for add Staff", StatusCodes.BAD_REQUEST));
        }

        const existingStaff = await Staff.findOne({ mobile_number });
        if (existingStaff) {
            return next(new ErrorHandler("mobile_number is already in use", StatusCodes.BAD_REQUEST));
        }

        const staff = new Staff({
            image,
            name,
            mobile_number,
            gender,
            bio,
            user_name,
        });
        await staff.save();

        return res.status(StatusCodes.CREATED).json({
            status: StatusCodes.CREATED,
            success: true,
            message: `Staff Add successfully`,
        });

    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

const getAllStaff = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page_no) || 1;
        const perPage = parseInt(req.query.items_per_page) || 10;

        const { search_text } = req.query;

        const query = search_text ? { $or: [{ name: { $regex: search_text, $options: 'i' } }, { user_name: { $regex: search_text, $options: 'i' } }] } : {};

        const skip = (page - 1) * perPage;
        const staffs = await Staff.find(query)
            .skip(skip)
            .limit(perPage);
        const totalStaffs = await Staff.countDocuments(query);
        const allStaffs = await Staff.countDocuments()

        const totalPages = Math.ceil(totalStaffs / perPage);

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            data: staffs,
            pagination: {
                total_items: allStaffs,
                total_pages: totalPages,
                current_page_item: staffs.length,
                page_no: parseInt(page),
                items_per_page: parseInt(perPage),
            },
        });

    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

const getOneStaff = async (req, res, next) => {
    try {
        const staffId = req.params.id;

        const staff = await Staff.findById(staffId);

        if (!staff) {
            return next(new ErrorHandler(`Staff not found with id ${staffId}`, StatusCodes.NOT_FOUND));
        }

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            data: staff,
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));

    }
}

const updateStaff = async (req, res, next) => {
    try {
        const staffId = req.params.id;

        const {
            user_name,
            name,
            mobile_number,
            gender,
            bio,
            image,
            Language,
            Age,
            status,
            charges,
        } = req.body;

        const updatedStaffData = {
            user_name,
            name,
            mobile_number,
            gender,
            bio,
            image,
            Language,
            Age,
            status,
            charges,
        };

        const updatedStaff = await Staff.findByIdAndUpdate(
            staffId,
            { $set: updatedStaffData },
            { new: true }
        );

        if (!updatedStaff) {
            return next(new ErrorHandler(`Staff not found with id ${staffId}`, StatusCodes.NOT_FOUND));
        }

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Staff updated successfully`,
            data: updatedStaff,
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const deleteStaff = async (req, res, next) => {
    try {
        const staffId = req.params.id;

        const existingStaff = await Staff.findById(staffId);

        if (!existingStaff) {
            return next(new ErrorHandler(`staff not found with id ${staffId}`, StatusCodes.NOT_FOUND));
        }

        const deletedStaff = await Staff.findByIdAndDelete(staffId);

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Staff deleted successfully`,
            data: {
                deletedStaff,
            },
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const updateChargesForAllStaff = async (req, res, next) => {
    try {
        const { newCharges } = req.body;

        if (!newCharges) {
            return next(new ErrorHandler("New charges are required", StatusCodes.BAD_REQUEST));
        }

        await Staff.updateMany({}, { $set: { charges: newCharges } });

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: "Charges updated for all staff members successfully",
        });
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
                    _id: { staff_id: "$_id", staff_name: "$name" },
                    mobile_number: { $first: "$mobile_number" },
                    username: { $first: "$user_name" },
                    rating: { $max: "$reviews.user_reviews.rating" },
                    charges: { charges: "$charges" },
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
                    mobile_number: 1,
                    username: 1,
                    rating: 1,
                    charges: "$_id.charges"
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
module.exports = {
    addStaff,
    getAllStaff,
    getOneStaff,
    updateStaff,
    deleteStaff,
    updateChargesForAllStaff,
    getTopRatedStaff
};
const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../middleware/errorHandler");
const Staff = require("../../models/staffModel");
const FileUplaodToFirebase = require("../../middleware/multerConfig");
const { getAllAngelsSocket } = require("../staffController/staffController");

const addStaff = async (req, res, next) => {
    try {
        const {
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
            return next(new ErrorHandler("Mobile Number is already in use", StatusCodes.BAD_REQUEST));
        }

        const image = req.file;

        if (!image) {
            return next(new ErrorHandler("Image image is required", StatusCodes.BAD_REQUEST));
        }

        const certificateDownloadURL = await FileUplaodToFirebase.uploadCertifiesToFierbase(image);

        const staff = new Staff({
            image: certificateDownloadURL,
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
};

const getAllStaff = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page_no) || 1;
        const perPage = parseInt(req.query.items_per_page) || 100;

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
};

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
};

const updateStaff = async (req, res, next) => {
    try {
        const staffId = req.params.id;

        const {
            user_name,
            name,
            gender,
            bio,
            language,
            age,
            status,
        } = req.body;
        const newImage = req.file;

        const updatedStaffData = {
            user_name,
            name,
            gender,
            bio,
            language,
            age,
            status,
        };

        if (newImage) {
            const existingEmployee = await Staff.findById(staffId);

            if (existingEmployee.image) {
                await FileUplaodToFirebase.deleteFileFromFirebase(existingEmployee.image);
            }

            const newAvatarURL = await FileUplaodToFirebase.uploadCertifiesToFierbase(newImage);
            updatedStaffData.image = newAvatarURL;
        }

        const updatedStaff = await Staff.findByIdAndUpdate(
            staffId,
            { $set: updatedStaffData },
            { new: true }
        );

        if (!updatedStaff) {
            return next(new ErrorHandler(`Staff not found with id ${staffId}`, StatusCodes.NOT_FOUND));
        }
        await getAllAngelsSocket();

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

        if (existingStaff.image) {
            await FileUplaodToFirebase.deleteFileFromFirebase(existingStaff.image);
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



module.exports = {
    addStaff,
    getAllStaff,
    getOneStaff,
    updateStaff,
    deleteStaff,
};
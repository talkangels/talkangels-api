const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../middleware/errorHandler");
const Admin = require("../../models/adminModel");
const { generateToken } = require("../../utils/tokenGenerator");
const User = require("../../models/userModel");
const staffModel = require("../../models/staffModel");

const registerAdmin = async (req, res, next) => {
    try {
        const { email, name, password, mobile_number } = req.body;

        if (!email || !password) {
            return next(new ErrorHandler("All fields are required for registration", StatusCodes.BAD_REQUEST));
        }
        const existingUser = await Admin.findOne({ email });
        if (existingUser) {
            return next(new ErrorHandler("User Id is already in use", StatusCodes.BAD_REQUEST));
        }
        const admin = new Admin({ email, name, password, mobile_number });
        await admin.save();

        return res.status(StatusCodes.CREATED).json({
            status: StatusCodes.CREATED,
            success: true,
            message: `${admin.role} registered successfully`,
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const loginAdmin = async (req, res, next) => {
    try {
        const { email, password, fcmToken } = req.body;

        if (!email || !password) {
            return next(new ErrorHandler("All fields are required for login", StatusCodes.BAD_REQUEST));
        }

        const user = await Admin.findOne({ email }).select("+password");

        if (!user) {
            return next(new ErrorHandler("Authentication failed", StatusCodes.UNAUTHORIZED));
        }

        if (password === user.password) {

            const staffs = await staffModel.find()

            const userWithoutPassword = { ...user.toObject() };
            delete userWithoutPassword.password;
            if (fcmToken) {
                user.fcmToken = fcmToken;
                await user.save();
            }
            const token = generateToken(user);
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                message: `${user.role} logged in successfully`,
                user: userWithoutPassword,
                charges: staffs ? staffs[0].charges : 0,
                Token: token
            });
        } else {
            return next(new ErrorHandler("Authentication failed", StatusCodes.UNAUTHORIZED));
        }
    } catch (error) {
        console.error("Error during login:", error);
        return next(new ErrorHandler("Authentication failed", StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

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

        return res.status(StatusCodes.CREATED).json({
            status: StatusCodes.CREATED,
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
}

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
}

module.exports = {
    registerAdmin,
    loginAdmin,
    getAllUser,
    updateUserStatus
};
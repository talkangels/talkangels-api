const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../middleware/errorHandler");
const Admin = require("../../models/adminModel");
const Staff = require("../../models/staffModel");
const { generateToken } = require("../../utils/tokenGenerator");

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
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ErrorHandler("All fields are required for login", StatusCodes.BAD_REQUEST));
        }

        const user = await Admin.findOne({ email }).select("+password");

        if (!user) {
            return next(new ErrorHandler("Authentication failed", StatusCodes.UNAUTHORIZED));
        }

        if (password === user.password) {
            const userWithoutPassword = { ...user.toObject() };
            delete userWithoutPassword.password;

            const token = generateToken(user);
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                message: `${user.role} logged in successfully`,
                user: userWithoutPassword,
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

module.exports = {
    registerAdmin,
    loginAdmin,
};
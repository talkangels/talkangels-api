const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../../middleware/errorHandler");
const Admin = require("../../../models/adminModel");
const Listener = require("../../../models/listenerModel");
const Staff = require("../../../models/staffModel");


const addListener = async (req, res, next) => {
    try {
        const {
            name,
            mobile_number,
            country_code,
            gender,
            bio,
            language,
            age,
            email
        } = req.body;

        if (!name || !mobile_number || !gender || !bio || !language || !age || !email) {
            return next(new ErrorHandler("All fields are required for sent request.", StatusCodes.BAD_REQUEST));
        }

        const existingStaff = await Staff.findOne({ mobile_number });
        if (existingStaff) {
            return next(new ErrorHandler("Mobile Number is already in use as Listener", StatusCodes.BAD_REQUEST));
        }

        const existingListenerReq = await Listener.findOne({ mobile_number });
        if (existingListenerReq) {
            return next(new ErrorHandler("Your Request is pending please wait to approve.", StatusCodes.BAD_REQUEST));
        }

        const listener = new Listener({
            name,
            mobile_number,
            country_code,
            gender,
            bio,
            language,
            age,
            email
        });
        await listener.save();

        return res.status(StatusCodes.CREATED).json({
            status: StatusCodes.CREATED,
            success: true,
            message: `Requst Sent Successfully.`,
        });

    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getCharges = async (req, res, next) => {
    try {
        const admin = await Admin.findOne({ role: 'admin' });
        if (!admin) {
            return next(new ErrorHandler("Charges not found", StatusCodes.NOT_FOUND));
        }
        return res.status(StatusCodes.CREATED).json({
            status: StatusCodes.CREATED,
            success: true,
            data: {
                video_call: "",
                call: admin.staff_charges,
                chat: ""
            }
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

const getAllListener = async (req, res, next) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : {};

        const listeners = await Listener.find(query);

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            data: listeners,
        });

    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const updateListener = async (req, res, next) => {
    try {
        const listenerId = req.params.id;
        const { status } = req.body;
        if (status !== 0 && status !== 1) {
            return next(new ErrorHandler('Status can only be 0 or 1', StatusCodes.BAD_REQUEST));
        }

        const updatedListener = await Listener.findByIdAndUpdate(
            listenerId,
            { $set: { status } },
            { new: true }
        );

        if (!updatedListener) {
            return next(new ErrorHandler(`Listener not found with id ${listenerId}`, StatusCodes.NOT_FOUND));
        }

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Listener updated successfully`,
            data: updatedListener,
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const deleteListener = async (req, res, next) => {
    try {
        const listenerId = req.params.id;

        const existingListener = await Listener.findById(listenerId);

        if (!existingListener) {
            return next(new ErrorHandler(`staff not found with id ${listenerId}`, StatusCodes.NOT_FOUND));
        }

        const deletedListener = await Listener.findByIdAndDelete(listenerId);

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Listener deleted successfully`,
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    addListener,
    getCharges,
    getAllListener,
    updateListener,
    deleteListener
};
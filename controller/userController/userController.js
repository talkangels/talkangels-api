const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../middleware/errorHandler");
const User = require("../../models/userModel");
const { generateToken } = require("../../utils/tokenGenerator");
const Staff = require("../../models/staffModel");
const Recharges = require("../../models/rechargeModel");


const logInUser = async (req, res, next) => {
    try {
        const { name, mobile_number, country_code, fcmToken } = req.body;

        if (!name || !mobile_number) {
            return next(new ErrorHandler("All fields are required for LogIn", StatusCodes.BAD_REQUEST));
        }

        let user = await User.findOne({ mobile_number });

        if (!user) {
            user = new User({
                mobile_number,
                name,
                country_code
            });
            await user.save();

            if (fcmToken) {
                user.fcmToken = fcmToken;
                await user.save();
            }

            const token = generateToken(user);
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                success: true,
                message: `User logged in successfully`,
                data: user,
                Token: token,
            });
        } else {
            if (fcmToken) {
                user.fcmToken = fcmToken;
                await user.save();
            }
            const token = generateToken(user);
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                success: true,
                message: `User logged in successfully`,
                data: user,
                Token: token,
            });
        }
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

const getAllAngels = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page_no) || 1;
        const perPage = parseInt(req.query.items_per_page) || 10;

        const { search_text } = req.query;
        const query = {
            ... (search_text ? {
                $or: [
                    { name: { $regex: search_text, $options: 'i' } },
                    { user_name: { $regex: search_text, $options: 'i' } }
                ]
            } : {}),
            status: 1,
        };

        const skip = (page - 1) * perPage;
        const staffs = await Staff.find(query)
            .skip(skip)
            .limit(perPage);
        const totalStaffs = await Staff.countDocuments(query);
        const allStaffs = await Staff.countDocuments();

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

module.exports = {
    logInUser,
    getAllAngels,
};
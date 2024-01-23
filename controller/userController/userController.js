const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../middleware/errorHandler");
const User = require("../../models/userModel");
const Staff = require("../../models/staffModel");
const Report = require("../../models/reportAndProblem");

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
        const staffData = staffs.map(staffs => ({
            "_id": staffs._id,
            "user_name": staffs.user_name,
            "name": staffs.name,
            "mobile_number": staffs.mobile_number,
            "gender": staffs.gender,
            "bio": staffs.bio,
            "image": staffs.image,
            "language": staffs.language,
            "age": staffs.age,
            "active_status": staffs.active_status,
            "call_status": staffs.call_status,
            "charges": staffs.charges,
            "fcmToken": staffs.fcmToken,
            "country_code": staffs.country_code,
            "total_rating": staffs.total_rating,
            "reviews": staffs.reviews.reduce((allReviews, review) => allReviews.concat(review.user_reviews), []),
        }))

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            data: staffData,
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

const getOneUser = async (req, res, next) => {
    try {
        const user_id = req.params.id;

        const user = await User.findById(user_id);

        if (!user) {
            return next(new ErrorHandler(`user not found with id ${user_id}`, StatusCodes.NOT_FOUND));
        }

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            data: user,
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));

    }
}

const applyReferralCode = async (req, res, next) => {
    try {
        const { user_id, refer_code } = req.body;

        if (!user_id || !refer_code) {
            return next(new ErrorHandler("All fields are required for apply refer code.", StatusCodes.BAD_REQUEST));
        }
        let user = await User.findById(user_id);

        if (!user) {
            return next(new ErrorHandler(`user not found with id ${user_id}`, StatusCodes.NOT_FOUND));
        }
        if (user.refer_code_status === 1) {
            return next(new ErrorHandler("User allready applyed refer code.", StatusCodes.BAD_REQUEST));
        }
        let referUser = await User.findOne({ refer_code });

        if (!referUser) {
            return next(new ErrorHandler(`Invalid Refer Code`, StatusCodes.BAD_REQUEST));
        }
        if (refer_code === user.refer_code) {
            return next(new ErrorHandler(`Invalid Refer Code`, StatusCodes.BAD_REQUEST));
        }

        const currentTime = new Date();
        const amount = 10

        if (referUser) {
            referUser.talk_angel_wallet.transections = referUser.talk_angel_wallet.transections || [];
            referUser.talk_angel_wallet.transections.push({
                amount: amount,
                type: 'refer-code',
                curent_bellance: referUser.talk_angel_wallet.total_ballance,
                date: currentTime,
            });
            referUser.talk_angel_wallet.total_ballance = (parseFloat(referUser.talk_angel_wallet.total_ballance) + parseFloat(amount)).toString();
        }

        if (user) {
            user.talk_angel_wallet.transections = user.talk_angel_wallet.transections || [];
            user.talk_angel_wallet.transections.push({
                amount: amount,
                type: 'refer-code',
                curent_bellance: user.talk_angel_wallet.total_ballance,
                date: currentTime,
            });
            user.talk_angel_wallet.total_ballance = (parseFloat(user.talk_angel_wallet.total_ballance) + parseFloat(amount)).toString();
            user.refer_code_status = 1
        }

        await referUser.save();
        await user.save();

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `ReferCode applyed successfully`,
        });

    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));

    }
}

const getOneAngel = async (req, res, next) => {
    try {
        const staffId = req.params.id;
        const staff = await Staff.findById(staffId);

        if (!staff) {
            return next(new ErrorHandler(`Staff not found with id ${staffId}`, StatusCodes.NOT_FOUND));
        }

        const staffData = {
            "_id": staff._id,
            "user_name": staff.user_name,
            "name": staff.name,
            "mobile_number": staff.mobile_number,
            "gender": staff.gender,
            "bio": staff.bio,
            "image": staff.image,
            "language": staff.language,
            "age": staff.age,
            "active_status": staff.active_status,
            "call_status": staff.call_status,
            "charges": staff.charges,
            "fcmToken": staff.fcmToken,
            "country_code": staff.country_code,
            "total_rating": staff.total_rating,
            "listing_hours": staff.listing.total_minutes,
            "reviews": staff.reviews.reduce((allReviews, review) => allReviews.concat(review.user_reviews), []),
        }

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            data: staffData,
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

const addReport = async (req, res, next) => {
    try {
        const { user, staff, comment } = req.body;

        if (!comment) {
            return next(new ErrorHandler("All fields are required", StatusCodes.BAD_REQUEST));
        }

        const report = new Report({
            user,
            staff,
            comment,
            date: new Date()
        });
        await report.save();

        return res.status(StatusCodes.CREATED).json({
            status: StatusCodes.CREATED,
            success: true,
            message: `Report sent successfully`,
        });

    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

const deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.id;

        const existingUser = await User.findById(userId);

        if (!existingUser) {
            return next(new ErrorHandler(`User not found`, StatusCodes.NOT_FOUND));
        }

        const deletedUser = await User.findByIdAndDelete(userId);

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `User deleted successfully`
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    getAllAngels,
    getOneUser,
    applyReferralCode,
    getOneAngel,
    addReport,
    deleteUser
};
const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../middleware/errorHandler");
const User = require("../../models/userModel");
const { generateToken } = require("../../utils/tokenGenerator");
const Staff = require("../../models/staffModel");

const logIn = async (req, res, next) => {
    try {
        const { name, mobile_number, country_code, fcmToken } = req.body;

        if (!name || !mobile_number) {
            return next(new ErrorHandler("All fields are required for LogIn", StatusCodes.BAD_REQUEST));
        }

        let staff = await Staff.findOne({ mobile_number });
        let user = await User.findOne({ mobile_number });

        if (staff) {
            if (fcmToken) {
                staff.fcmToken = fcmToken;
                staff.active_status = 'Online'
                await staff.save();
            }
            const token = generateToken(staff);
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                success: true,
                message: `Staff logged in successfully`,
                data: staff,
                role: staff.role,
                Token: token,
            });
        } else {
            if (!user) {
                const newReferralCode = generateRandomReferralCode();
                user = new User({
                    mobile_number,
                    name,
                    country_code,
                    refer_code: newReferralCode
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
                    role: user.role,
                    Token: token,
                });
            } else {
                if (user.status === 0) {
                    return next(new ErrorHandler(`'${mobile_number}' this number is blocked`, StatusCodes.BAD_REQUEST));
                }
                if (fcmToken) {
                    user.fcmToken = fcmToken;
                    await user.save();
                }
                user.refer_code_status = 1
                const token = generateToken(user);
                return res.status(StatusCodes.OK).json({
                    status: StatusCodes.OK,
                    success: true,
                    message: `User logged in successfully`,
                    data: user,
                    role: user.role,
                    Token: token,
                });
            }
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
            "total_rating": staffs.total_rating
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

const generateRandomReferralCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const codeLength = 8;
    let referralCode = '';

    for (let i = 0; i < codeLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        referralCode += characters.charAt(randomIndex);
    }

    return referralCode;
};

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

module.exports = {
    logIn,
    getAllAngels,
    getOneUser,
    applyReferralCode
};
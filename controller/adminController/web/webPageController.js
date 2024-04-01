const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../../middleware/errorHandler");
const WebPage = require("../../../models/webPageModel");
const Staff = require("../../../models/staffModel");

const addWePage = async (req, res, next) => {
    try {
        const {
            page,
            data
        } = req.body;

        if (!page || !data || !Array.isArray(data) || data.length === 0) {
            return next(new ErrorHandler("Page and data are required for adding web page details", StatusCodes.BAD_REQUEST));
        }

        let webPage = await WebPage.findOne({ page });
        if (webPage) {
            webPage.data = data;
        } else {
            webPage = new WebPage({ page, data });
        }

        await webPage.save();
        return res.status(StatusCodes.CREATED).json({
            status: StatusCodes.CREATED,
            success: true,
            message: `Page added successfully`,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message || "Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getPageData = async (req, res, next) => {
    try {
        const { page } = req.body;
        const webPage = await WebPage.findOne({ page }).select("-_id").select("-__v");
        if (!webPage) {
            return next(new ErrorHandler("Page not found", StatusCodes.NOT_FOUND));
        }

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            data: webPage,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message || "Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getAllPageNames = async (req, res, next) => {
    try {
        const pages = await WebPage.find({}, 'page');

        const pageNames = pages.map(page => page.page);

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            data: pageNames,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message || "Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const deletePage = async (req, res, next) => {
    try {
        const { page } = req.body;

        const deletedPage = await WebPage.findOneAndDelete({ page });

        if (!deletedPage) {
            return next(new ErrorHandler("Page not found", StatusCodes.NOT_FOUND));
        }

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Page "${page}" deleted successfully`,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message || "Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getAllStaffWebPage = async (req, res, next) => {
    try {
        const staffs = await Staff.find()
        const staffData = staffs.map(staffs => ({
            "_id": staffs._id,
            "user_name": staffs.user_name,
            "name": staffs.name,
            "gender": staffs.gender,
            "bio": staffs.bio,
            "image": staffs.image,
            "language": staffs.language,
            "age": staffs.age,
            "active_status": staffs.active_status,
            "call_status": staffs.call_status,
            "total_rating": staffs.total_rating,
            "call_available_status": staffs.call_available_status,
            "total_listing": staffs.listing.total_minutes,
            "reviews": staffs.reviews.reduce((allReviews, review) => allReviews.concat(review.user_reviews), []),
        }))

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            data: staffData
        });

    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    addWePage,
    getPageData,
    deletePage,
    getAllPageNames,
    getAllStaffWebPage
};
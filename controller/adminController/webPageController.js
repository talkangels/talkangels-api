const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../middleware/errorHandler");
const WebPage = require("../../models/webPageModel");

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


module.exports = {
    addWePage,
    getPageData
};
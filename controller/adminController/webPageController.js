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

        const existingPage = await WebPage.findOne({ page });
        if (existingPage) {
            return next(new ErrorHandler("Page is already in use", StatusCodes.BAD_REQUEST));
        }

        const webPage = new WebPage({
            page,
            data
        });
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

module.exports = {
    addWePage
};

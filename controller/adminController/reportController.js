const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../middleware/errorHandler");
const Report = require("../../models/reportAndProblem");
const User = require("../../models/userModel");
const Staff = require("../../models/staffModel");

const getAllReport = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page_no) || 1;
        const perPage = parseInt(req.query.items_per_page) || 10;
        const { search_text } = req.query;

        const query = search_text ? { $or: [{ comment: { $regex: search_text, $options: 'i' } }] } : {};
        const skip = (page - 1) * perPage;

        const reports = await Report.find(query)
            .skip(skip)
            .limit(perPage)
            .populate('user staff');

        const totalReports = await Report.countDocuments(query);
        const allReports = await Report.countDocuments()

        const totalPages = Math.ceil(totalReports / perPage);

        // Extracting necessary information from populated fields
        const data = reports.map(report => ({
            _id: report._id,
            date: report.date,
            comment: report.comment,
            status: report.status,
            user: report.user ?
                { _id: report.user._id, name: report.user.name, number: report.user.mobile_number, role: report.user.role }
                : report.staff ?
                    { staff: report.staff._id, name: report.staff.name, number: report.staff.mobile_number, role: report.staff.role }
                    : [],
            __v: report.__v
        }));

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            data,
            pagination: {
                total_items: allReports,
                total_pages: totalPages,
                current_page_item: reports.length,
                page_no: parseInt(page),
                items_per_page: parseInt(perPage),
            },
        });

    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

const updateReportStatus = async (req, res, next) => {
    try {
        const { reportId } = req.params;
        const { newStatus } = req.body;

        if (![0, 1].includes(newStatus)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.BAD_REQUEST,
                success: false,
                message: "Invalid status value",
            });
        }

        const updatedReport = await Report.findByIdAndUpdate(
            reportId,
            { $set: { status: newStatus } },
            { new: true }
        );

        if (!updatedReport) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusCodes.NOT_FOUND,
                success: false,
                message: "Report not found",
            });
        }

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: "Report status updated successfully",
            data: updatedReport,
        });

    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}


module.exports = {
    getAllReport,
    updateReportStatus
};

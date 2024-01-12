const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../middleware/errorHandler");
const User = require("../../models/userModel");
const Staff = require("../../models/staffModel");

const addRating = async (req, res, next) => {
    try {
        const { user_id, angel_id, rating, comment } = req.body;
        if (!angel_id || !user_id || !rating) {
            return next(new ErrorHandler("All fields are required", StatusCodes.BAD_REQUEST));
        }

        const staff = await Staff.findById(angel_id);

        if (!staff) {
            return next(new ErrorHandler(`Staff not found with id ${angel_id}`, StatusCodes.NOT_FOUND));
        }

        const user = await User.findById(user_id);

        if (!user) {
            return next(new ErrorHandler(`User not found with id ${user_id}`, StatusCodes.NOT_FOUND));
        }

        const userReviewsIndex = staff.reviews.findIndex(review => review.user.toString() === user_id);

        if (userReviewsIndex !== -1) {
            staff.reviews[userReviewsIndex].user_reviews.push({
                rating,
                comment,
            });
        } else {
            staff.reviews.push({
                user: user_id,
                user_reviews: [{
                    rating,
                    comment,
                }],
            });
        }

        const maxRating = 5.0;

        const totalRatings = staff.reviews.reduce((sum, review) => {
            const userRatingsSum = review.user_reviews.reduce((userSum, userReview) => userSum + userReview.rating, 0);
            return sum + (userRatingsSum / review.user_reviews.length);
        }, 0);

        staff.total_rating = Math.min(totalRatings / staff.reviews.length, maxRating);

        await staff.save();

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: "Rating added successfully",
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getTotalRatings = async (req, res, next) => {
    try {
        const staffList = await Staff.find().populate({
            path: 'reviews.user',
            model: 'User',
            select: 'name mobile_number user_name',
        });

        const ratingList = staffList.map(staff => {
            const totalRatings = staff.reviews.reduce((sum, review) => {
                const userRatingsSum = review.user_reviews.reduce((userSum, userReview) => userSum + userReview.rating, 0);
                return sum + (userRatingsSum / review.user_reviews.length);
            }, 0);

            return {
                staff_name: staff.name,
                mobile_number: staff.mobile_number,
                username: staff.user_name,
                rating: totalRatings / staff.reviews.length || 0,
            };
        });

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: "Total ratings retrieved successfully",
            data: ratingList,
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    addRating,
    getTotalRatings
};
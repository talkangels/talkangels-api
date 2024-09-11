const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../middleware/errorHandler");
const User = require("../../models/userModel");
const Recharges = require("../../models/rechargeModel");

const crypto = require("crypto");
const { Cashfree } = require("cashfree-pg");

Cashfree.XClientId = process.env.CLIENT_ID;
Cashfree.XClientSecret = process.env.CLIENT_SECRET;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

function generateOrderId() {
  const uniqueId = crypto.randomBytes(16).toString("hex");

  const hash = crypto.createHash("sha256");
  hash.update(uniqueId);

  const orderId = hash.digest("hex");

  return orderId.substr(0, 12);
}

const getAllRecharges = async (req, res, next) => {
  try {
    const query = {
      status: 1,
    };

    const recharges = await Recharges.find(query);

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      success: true,
      data: recharges,
    });
  } catch (error) {
    return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

const ProceedPayment = async (req, res, next) => {
  try {
    const user_id = req.params.user_id;
    const { phone, name, amount } = req.query;

    if (!user_id || !amount) {
      return next(
        new ErrorHandler(
          "user_id and amount are required",
          StatusCodes.BAD_REQUEST
        )
      );
    }

    const user = await User.findById(user_id);

    if (!user) {
      return next(new ErrorHandler("User not found", StatusCodes.NOT_FOUND));
    }

    let request = {
      order_amount: amount,
      order_currency: "INR",
      order_id: await generateOrderId(),
      customer_details: {
        customer_id: user_id,
        customer_phone: phone,
        customer_name: name,
      },
    };

    Cashfree.PGCreateOrder("2023-08-01", request)
      .then(async (response) => {
        const currentTime = new Date();

        user.talk_angel_wallet.transections =
          user.talk_angel_wallet.transections || [];

        user.talk_angel_wallet.transections.push({
          amount: amount,
          type: "credit",
          curent_bellance: user.talk_angel_wallet.total_ballance,
          payment_id: response.data.order_id,
          date: currentTime,
          payment_details: [],
        });

        await user.save();

        return res.status(StatusCodes.OK).json({
          status: StatusCodes.OK,
          success: true,
          message: "Payment create successfully",
          data: response.data,
        });
      })
      .catch((error) => {
        return next(
          new ErrorHandler(
            error.response.data,
            StatusCodes.INTERNAL_SERVER_ERROR
          )
        );
      });
  } catch (error) {
    return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

const addBalance = async (req, res, next) => {
  try {
    const { user_id, payment_id } = req.body;

    if (!user_id || !payment_id) {
      return next(
        new ErrorHandler(
          "user_id and payment_id are required",
          StatusCodes.BAD_REQUEST
        )
      );
    }

    const user = await User.findById(user_id);

    if (!user) {
      return next(new ErrorHandler("User not found", StatusCodes.NOT_FOUND));
    }

    const transactionIndex = user.talk_angel_wallet.transections.findIndex(
      (txn) => txn.payment_id === payment_id
    );

    try {
      const paymentDetails = await Cashfree.PGOrderFetchPayments(
        "2023-08-01",
        payment_id
      );

      if (!paymentDetails.data || paymentDetails.data.length === 0) {
        return next(
          new ErrorHandler("No payment details found", StatusCodes.NOT_FOUND)
        );
      }

      const paymentDetail = paymentDetails.data[0];
      if (paymentDetail.payment_status) {
        if (transactionIndex === -1) {
          new ErrorHandler(
            "Payment not available",
            StatusCodes.INTERNAL_SERVER_ERROR
          );
        } else {
          user.talk_angel_wallet.transections[
            transactionIndex
          ].payment_details = paymentDetails.data;
          user.talk_angel_wallet.transections[transactionIndex].status =
            paymentDetails.data[0].payment_status;
        }

        if (paymentDetail.payment_status === "SUCCESS") {
          user.talk_angel_wallet.total_ballance += parseFloat(
            paymentDetail.payment_amount
          );
        }

        const updatedUser = await user.save();

        return res.status(StatusCodes.OK).json({
          status: StatusCodes.OK,
          success: true,
          message: `Transaction ${payment_id} processed successfully. Balance has been updated.`,
          data: updatedUser.talk_angel_wallet.total_ballance,
        });
      } else {
        return next(
          new ErrorHandler("Payment failed", StatusCodes.INTERNAL_SERVER_ERROR)
        );
      }
    } catch (paymentError) {
      console.error("Error fetching payment details:", paymentError);
      return next(
        new ErrorHandler(
          `Error fetching payment details: ${paymentError.message}`,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }
  } catch (error) {
    console.error("General error:", error);
    return next(
      new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

// const addBallance = async (req, res, next) => {
//   try {
//     const { user_id, payment_id } = req.body;

//     if (!user_id || !payment_id) {
//       return next(
//         new ErrorHandler(
//           "user_id and paymeny_id are required",
//           StatusCodes.BAD_REQUEST
//         )
//       );
//     }

//     const user = await User.findById(user_id);

//     if (!user) {
//       return next(new ErrorHandler("User not found", StatusCodes.NOT_FOUND));
//     }

//     Cashfree.PGOrderFetchPayments("2023-08-01", payment_id)
//       .then(async (response) => {
//         if (response.data.payment_status) {
//           user.transactions.push({
//             payment_id,
//             payment_details: response.data,
//           });
//           await user.save();
//         }

//         return res.status(StatusCodes.OK).json({
//           status: StatusCodes.OK,
//           success: true,
//           message: "Balance added successfully",
//           data: {
//             cashfree: response.data,
//             data: user.talk_angel_wallet.transections.find(
//               (transection) => transection.payment_id === payment_id
//             ),
//           },
//         });
//       })
//       .catch((error) => {
//         return next(
//           new ErrorHandler(
//             error.response.data.message,
//             StatusCodes.INTERNAL_SERVER_ERROR
//           )
//         );
//       });

//     // user.talk_angel_wallet.transections.find(
//     //   (transection) => transection.payment_id === req.body.payment_id
//     // );

//     // user.talk_angel_wallet.total_ballance = (
//     //   parseFloat(user.talk_angel_wallet.total_ballance) + parseFloat(amount)
//     // ).toString();
//   } catch (error) {
//     return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
//   }
// };

const VerifyPayment = async (req, res, next) => {
  try {
    const order_id = req.params.order_id;

    if (!order_id) {
      return next(
        new ErrorHandler("order_id is required", StatusCodes.BAD_REQUEST)
      );
    }

    Cashfree.PGOrderFetchPayments("2023-08-01", order_id)
      .then((response) => {
        return res.status(StatusCodes.OK).json({
          status: StatusCodes.OK,
          success: true,
          data: response.data,
        });
      })
      .catch((error) => {
        return next(
          new ErrorHandler(
            error.response.data.message,
            StatusCodes.INTERNAL_SERVER_ERROR
          )
        );
      });
  } catch (error) {
    return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

const getPaymentHistory = async (req, res, next) => {
  try {
    const user_id = req.params.id;

    if (!user_id) {
      return next(
        new ErrorHandler("user_id is required", StatusCodes.BAD_REQUEST)
      );
    }

    const user = await User.findById(user_id);

    if (!user) {
      return next(new ErrorHandler("User not found", StatusCodes.NOT_FOUND));
    }

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      success: true,
      data: user.talk_angel_wallet,
    });
  } catch (error) {
    return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

module.exports = {
  getAllRecharges,
  addBalance,
  ProceedPayment,
  VerifyPayment,
  getPaymentHistory,
};

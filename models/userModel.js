const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  user_name: {
    type: String,
    required: true,
    unique: true,
  },
  mobile_number: {
    type: Number,
    unique: true,
    required: true,
    validate: {
      validator: function (value) {
        return /^\d{10}$/.test(value);
      },
      message: (props) =>
        `${props.value} is not a valid 10-digit mobile number!`,
    },
  },
  country_code: {
    type: Number,
    required: true,
    default: 0,
  },
  talk_angel_wallet: {
    total_ballance: {
      type: Number,
      default: 0,
    },
    transections: [
      {
        amount: {
          type: Number,
          required: true,
        },
        payment_id: {
          type: String,
        },
        type: {
          type: String,
          default: "0",
        },
        status: {
          type: String,
          default: "0",
        },
        curent_bellance: {
          type: Number,
          required: true,
        },
        date: {
          type: Date,
          required: true,
        },
        payment_details: {
          type: mongoose.Schema.Types.Mixed, // Allows any type
          default: [],
        },
      },
    ],
  },
  refer_code: {
    type: String,
  },
  refer_code_status: {
    type: Number,
    required: true,
    enum: [0, 1],
    default: 0,
  },
  image: {
    type: String,
    default: "0",
  },
  status: {
    type: Number,
    required: true,
    enum: [0, 1],
    default: 1,
  },
  role: {
    type: String,
    default: "user",
  },
  log_out: {
    type: Number,
    required: true,
    enum: [0, 1],
    default: 1,
  },
  fcmToken: String,
});

const User = mongoose.model("User", userSchema);

module.exports = User;

const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const dotenv = require('dotenv');
const cors = require('cors');

const errorMiddleware = require("./errors/error");
dotenv.config({ path: "config/config.env" });

app.use(cors())
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route imports
const admin = require("./routes/adminRoute");
const user = require("./routes/userRoutes");
const staff = require("./routes/staffRoute");

app.use("/api/v1", admin);
app.use("/api/v1", user);
app.use("/api/v1", staff);

app.get('/', (req, res) => {
  res.send('Hey, this is my API running 🥳');
});

// Error
app.use(errorMiddleware);

module.exports = app;

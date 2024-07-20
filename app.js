const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");

const errorMiddleware = require("./errors/error");
dotenv.config({ path: "config/config.env" });

const app = express();
app.use(cors());
const socketManager = require("./utils/socketManager");
const server = http.createServer(app);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

socketManager.initSocket(server);

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet());

// Route imports
const admin = require("./routes/adminRoute");
const user = require("./routes/userRoutes");
const staff = require("./routes/staffRoute");

app.use("/api/v1", admin);
app.use("/api/v1", user);
app.use("/api/v1", staff);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "index.html"));
});

// Error
app.use(errorMiddleware);

module.exports = { app, server };

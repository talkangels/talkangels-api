const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');

const errorMiddleware = require('./errors/error');
dotenv.config({ path: 'config/config.env' });

const app = express();
const socketManager = require('./utils/socketManager');                       
const server = http.createServer(app);
socketManager.initSocket(server);

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route imports
const admin = require('./routes/adminRoute');
const user = require('./routes/userRoutes');
const staff = require('./routes/staffRoute');

app.use('/api/v1', admin);
app.use('/api/v1', user);
app.use('/api/v1', staff);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Error
app.use(errorMiddleware);

module.exports = { app, server };

const { app, server } = require('./app'); 
const dotenv = require('dotenv');
const connectDatabase = require('./database');

dotenv.config({ path: 'config/config.env' });
connectDatabase(); 
process.setMaxListeners(15);

// Start the server
const port = process.env.PORT || 3000; 
const serverInstance = server.listen(port, () => {
    console.log(`Server is working on port ${port}`);
});

process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to Unhandled Promise Rejection');
    serverInstance.close(() => {
        process.exit(1);
    });
});
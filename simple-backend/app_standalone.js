// simple-backend/app.js
const express = require('express');
const cron = require('node-cron');
const alertsRouter = require('./routes/alerts');
const updateAlerts = require('./updateAlerts');
const logger = require('./utils/logger');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001; // Use 3001 to avoid conflict with existing server.js if running

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/alerts', alertsRouter);

// Basic health check route
app.get('/', (req, res) => {
    res.send('Food Alert Service is running.');
});

// Schedule daily update at 3:00 AM
cron.schedule('0 3 * * *', async () => {
    logger.info('Running scheduled daily update...');
    try {
        await updateAlerts();
        logger.info('Scheduled update completed successfully.');
    } catch (error) {
        logger.error(`Scheduled update failed: ${error.message}`);
    }
});

// Start server
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
    logger.info(`Cron job scheduled for 03:00 daily.`);
});

module.exports = app;

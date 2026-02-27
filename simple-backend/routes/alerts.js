// simple-backend/routes/alerts.js
const express = require('express');
const router = express.Router();
const { getActiveAlerts, updateAlerts } = require('../services/alertService');
const updateAlertsScript = require('../updateAlerts');
const logger = require('../utils/logger');

// GET /api/alerts
router.get('/', (req, res) => {
    try {
        const { limit, category, lang } = req.query; // Added lang param
        let alerts = getActiveAlerts();

        // Check language filter
        if (lang) {
             // Supports 'en' or 'tc'
             alerts = alerts.filter(a => a.language === lang);
        } else {
             // Default behavior: return all? Or default to TC?
             // Let's return all, and let frontend filter, OR default to TC if not specified? 
             // Usually better to let frontend filtering if mixed content isn't desired.
             // But user asked for "auto change".
             // If frontend sends ?lang=en, we return English.
        }

        // Optional filtering by category if implemented in parsing
        if (category) {
            // This is a placeholder as category is not currently parsed
            // alerts = alerts.filter(a => a.category === category);
        }

        if (limit) {
            const limitNum = parseInt(limit);
            if (!isNaN(limitNum)) {
                alerts = alerts.slice(0, limitNum);
            }
        }

        res.json({
            success: true,
            count: alerts.length,
            data: alerts
        });
    } catch (error) {
        logger.error(`Error fetching alerts: ${error.message}`);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// POST /api/admin/refresh-alerts
router.post('/admin/refresh-alerts', async (req, res) => {
    try {
        logger.info('Manual trigger: Refreshing alerts...');
        // Execute the update logic
        await updateAlertsScript(); 
        
        res.json({ success: true, message: 'Alerts refresh triggered successfully.' });
    } catch (error) {
        logger.error(`Error manually refreshing alerts: ${error.message}`);
        res.status(500).json({ success: false, message: 'Failed to refresh alerts.' });
    }
});

module.exports = router;

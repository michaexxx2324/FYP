const express = require('express');
const router = express.Router();
const { getActiveAlerts, updateAlerts } = require('../services/alertService');
const updateAlertsScript = require('../updateAlerts');
const logger = require('../utils/logger');

router.get('/', (req, res) => {
    try {
        const { limit, category, lang } = req.query;
        let alerts = getActiveAlerts();

        if (lang) {
             alerts = alerts.filter(a => a.language === lang);
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

router.post('/admin/refresh-alerts', async (req, res) => {
    try {
        logger.info('Manual trigger: Refreshing alerts...');
        await updateAlertsScript(); 
        
        res.json({ success: true, message: 'Alerts refresh triggered successfully.' });
    } catch (error) {
        logger.error(`Error manually refreshing alerts: ${error.message}`);
        res.status(500).json({ success: false, message: 'Failed to refresh alerts.' });
    }
});

module.exports = router;

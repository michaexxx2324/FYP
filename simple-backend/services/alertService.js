// simple-backend/services/alertService.js
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const { isWithinLast7Days } = require('../utils/dateHelper');
const { parseRss } = require('./rssParser');
const axios = require('axios');

const ALERTS_FILE = path.join(__dirname, '../data/alerts.json');

const loadAlerts = () => {
    try {
        if (!fs.existsSync(ALERTS_FILE)) {
            return [];
        }
        const data = fs.readFileSync(ALERTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        logger.error(`Error loading alerts from file: ${error.message}`);
        return [];
    }
};

const saveAlerts = (alerts) => {
    try {
        fs.writeFileSync(ALERTS_FILE, JSON.stringify(alerts, null, 2));
    } catch (error) {
        logger.error(`Error saving alerts to file: ${error.message}`);
    }
};

const updateAlerts = async (newRssContent, language = 'tc') => {
    try {
        const newItems = await parseRss(newRssContent, language);
        let existingAlerts = loadAlerts();
        let addedCount = 0;

        newItems.forEach(item => {
            const isDuplicate = existingAlerts.some(
                existing => existing.title === item.title && existing.pubDate === item.pubDate && existing.language === item.language
            );

            if (!isDuplicate) {
                // Only consider if within last 7 days from now
                if (isWithinLast7Days(item.pubDate)) {
                    existingAlerts.push(item);
                    addedCount++;
                }
            }
        });

        // Clean up old alerts
        const validAlerts = existingAlerts.filter(alert => isWithinLast7Days(alert.pubDate));
        
        // Sort by pubDate desc
        validAlerts.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        saveAlerts(validAlerts);
        logger.info(`Updated alerts: Added ${addedCount}, Total valid: ${validAlerts.length}`);
        return validAlerts;
    } catch (error) {
        logger.error(`Error updating alerts: ${error.message}`);
        throw error;
    }
};

const getActiveAlerts = () => {
    const alerts = loadAlerts();
    return alerts.filter(alert => isWithinLast7Days(alert.pubDate))
                 .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
};

module.exports = {
    updateAlerts,
    getActiveAlerts,
    loadAlerts,
    saveAlerts
};

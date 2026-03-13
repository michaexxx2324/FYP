// simple-backend/services/alertService.js
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const { isWithinLast7Days } = require('../utils/dateHelper');
const { parseRss } = require('./rssParser');
const scraper = require('./scraper');
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

        for (const item of newItems) {
            const isDuplicate = existingAlerts.some(
                existing => existing.title === item.title && existing.pubDate === item.pubDate && existing.language === item.language
            );

            if (!isDuplicate) {
                // Fetch details from the link
                if (item.link) {
                    try {
                        const details = await scraper.fetchAlertDetails(item.link);
                        Object.assign(item, details);
                    } catch (err) {
                        logger.warn(`Failed to fetch details for ${item.link}: ${err.message}`);
                    }
                }
                existingAlerts.push(item);
                addedCount++;
            } else {
                // Check if existing item needs details (backfill)
                const existingIndex = existingAlerts.findIndex(
                    existing => existing.title === item.title && existing.pubDate === item.pubDate && existing.language === item.language
                );
                
                if (existingIndex !== -1) {
                    const existingItem = existingAlerts[existingIndex];
                    if (!existingItem.actionTaken && !existingItem.reason) {
                         // Missing details, fetch them
                         if (existingItem.link) {
                            try {
                                const details = await scraper.fetchAlertDetails(existingItem.link);
                                Object.assign(existingItem, details);
                                // Mark as updated so we save
                                addedCount++; 
                            } catch (err) {
                                logger.warn(`Failed to backfill details for ${existingItem.link}: ${err.message}`);
                            }
                         }
                    }
                }
            }
        }

        // Clean up old alerts - keep the latest 50 instead of filtering by 7 days
        // Sort by pubDate desc first
        existingAlerts.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        const validAlerts = existingAlerts.slice(0, 50);

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
    return alerts.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
};

module.exports = {
    updateAlerts,
    getActiveAlerts,
    loadAlerts,
    saveAlerts
};

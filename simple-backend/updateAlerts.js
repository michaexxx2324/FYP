// simple-backend/updateAlerts.js
const { fetchRssUrl } = require('./services/ckanApi');
const { parseRss } = require('./services/rssParser');
const { loadAlerts, saveAlerts } = require('./services/alertService');
const { isWithinLast7Days } = require('./utils/dateHelper');
const logger = require('./utils/logger');
const axios = require('axios');

async function updateSingleLanguage(lang) {
    try {
        const rssUrl = await fetchRssUrl(lang);
        if (!rssUrl) return;

        logger.info(`Updating ${lang.toUpperCase()} from RSS: ${rssUrl}`);
        const response = await axios.get(rssUrl);
        
        let alerts = loadAlerts();
        // We use the service function but we need to modify it or call logic here
        // The service logic was "updateAlerts(content)". Let's reuse internal logic of service or adapt.
        // Actually, let's just use the exposed updateAlerts from service if it handles appending.
        // But wait, the service's updateAlerts reads file, appends, writes file.
        // If we run this in parallel for TC and EN, we might have race conditions on file write.
        // Secure way: Run sequentially.
        
        const { updateAlerts: processAlerts } = require('./services/alertService');
        await processAlerts(response.data, lang);
        
    } catch (error) {
        logger.error(`Update failed for ${lang}: ${error.message}`);
    }
}

const updateAlerts = async () => {
    logger.info('Starting daily update...');
    
    // Update TC
    await updateSingleLanguage('tc');
    
    // Update EN
    await updateSingleLanguage('en');

    // Clean up old alerts (loading again to ensure we have latest combined)
    const { loadAlerts, saveAlerts } = require('./services/alertService');
    const { isWithinLast7Days } = require('./utils/dateHelper');
    
    let alerts = loadAlerts();
    const originalCount = alerts.length;
    
    // Sort before slicing to ensure we keep the latest ones
    alerts.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    
    // Keep up to 50 alerts instead of 7 days
    alerts = alerts.slice(0, 50);
    const removedCount = originalCount - alerts.length;

    saveAlerts(alerts);
    logger.info(`Update complete. Removed/Trimmed: ${removedCount > 0 ? removedCount : 0}, Total active: ${alerts.length}`);
};

if (require.main === module) {
    updateAlerts();
}

module.exports = updateAlerts;


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
        
        
        
        
        
        
        
        const { updateAlerts: processAlerts } = require('./services/alertService');
        await processAlerts(response.data, lang);
        
    } catch (error) {
        logger.error(`Update failed for ${lang}: ${error.message}`);
    }
}

const updateAlerts = async () => {
    logger.info('Starting daily update...');
    
    
    await updateSingleLanguage('tc');
    
    
    await updateSingleLanguage('en');

    
    const { loadAlerts, saveAlerts } = require('./services/alertService');
    const { isWithinLast7Days } = require('./utils/dateHelper');
    
    let alerts = loadAlerts();
    const originalCount = alerts.length;
    
    
    alerts.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    
    
    alerts = alerts.slice(0, 50);
    const removedCount = originalCount - alerts.length;

    saveAlerts(alerts);
    logger.info(`Update complete. Removed/Trimmed: ${removedCount > 0 ? removedCount : 0}, Total active: ${alerts.length}`);
};

if (require.main === module) {
    updateAlerts();
}

module.exports = updateAlerts;

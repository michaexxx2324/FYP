// simple-backend/initDatabase.js
const { fetchHistoricalFileUrls } = require('./services/historyApi');
const { parseRss } = require('./services/rssParser');
const { saveAlerts, loadAlerts } = require('./services/alertService');
const { isWithinLast7Days } = require('./utils/dateHelper');
const logger = require('./utils/logger');
const axios = require('axios');

const initDatabase = async () => {
    logger.info('Starting database initialization...');
    
    try {
        const fileUrls = await fetchHistoricalFileUrls();
        logger.info(`Found ${fileUrls.length} historical files.`);

        let allAlerts = [];

        // For efficiency, maybe only process recent files?
        // But the requirement says "get all historical...".
        // However, if we only keep 7 days, fetching from 2006 is wasteful.
        // We will process all as requested, but discard old ones immediately.

        for (const url of fileUrls) {
            try {
                // Determine language from URL
                let lang = 'tc'; // default
                if (url.includes('/english/') || url.includes('_en') || url.toLowerCase().includes('(english)')) {
                    lang = 'en';
                } else if (url.includes('/sc_chi/') || url.includes('_sc') || url.toLowerCase().includes('(simplified)')) {
                    lang = 'sc'; // Optional: support simplified chinese if needed, or skip
                }

                if (lang === 'sc') continue; // Skip simplified for now unless requested

                logger.info(`Fetching and parsing (${lang}): ${url}`);
                const response = await axios.get(url);
                const items = await parseRss(response.data, lang);
                
                // Filter for last 7 days
                const validItems = items.filter(item => isWithinLast7Days(item.pubDate));
                if (validItems.length > 0) {
                   allAlerts = allAlerts.concat(validItems);
                }
            } catch (err) {
                logger.error(`Failed to process ${url}: ${err.message}`);
                // Continue with next file
            }
        }

        // De-duplicate
        const uniqueAlerts = [];
        const seen = new Set();

        allAlerts.forEach(item => {
            // Key now includes language
            const key = `${item.language}-${item.title}-${item.pubDate}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueAlerts.push(item);
            }
        });

        // Sort
        uniqueAlerts.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        saveAlerts(uniqueAlerts);
        logger.info(`Database initialized with ${uniqueAlerts.length} active alerts.`);

    } catch (error) {
        logger.error(`Initialization failed: ${error.message}`);
        process.exit(1);
    }
};

if (require.main === module) {
    initDatabase();
}

module.exports = initDatabase;

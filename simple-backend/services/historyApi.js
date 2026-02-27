// simple-backend/services/historyApi.js
const axios = require('axios');
const logger = require('../utils/logger');
const { getCurrentDateString, dayjs } = require('../utils/dateHelper'); // Added dayjs import

const HISTORY_API_URL = 'https://app.data.gov.hk/v1/historical-archive/list-files';

const fetchHistoricalFileUrls = async () => {
    let allFileUrls = [];
    let skip = 0;
    const max = 20; // Default limit
    let hasMore = true;

    const endDate = dayjs().subtract(1, 'day').format('YYYYMMDD'); // End date must be at least yesterday per API spec
    
    try {
        while (hasMore) {
            const startDate = dayjs().subtract(8, 'day').format('YYYYMMDD'); // Optimization: Only fetch last 7 days of files (endDate - 6 days = last 7 days range)
            const params = {
                start: startDate, 
                end: endDate,
                provider: 'cfs',
                category: 'food',
                format: 'xml',
                skip: skip,
                max: max
            };

            logger.info(`Fetching historical files skipping ${skip}...`);
            const response = await axios.get(HISTORY_API_URL, { params });
            const data = response.data;

            if (data && data.files && data.files.length > 0) {
                 // The history API returns files for all languages mixed or typically one entry per file?
                 // Looking at previous output: .../foodalert/english/... and .../tc_chi/... are separate URLs.
                 // So we just collect all URLs, and then in initDatabase we need to decide how to parse them.
                 // The URLs usually indicate language. 
                 
                const urls = data.files.map(file => file.url);
                allFileUrls = allFileUrls.concat(urls);
                skip += data.files.length;
                
                // If the number of files returned is less than max, we have reached the end
                if (data.files.length < max) {
                    hasMore = false;
                }
            } else {
                hasMore = false;
            }
        }

        logger.info(`Fetched ${allFileUrls.length} historical file URLs.`);
        return allFileUrls;
    } catch (error) {
        logger.error(`Error fetching historical file URLs: ${error.message}`);
        throw error;
    }
};

module.exports = {
    fetchHistoricalFileUrls
};

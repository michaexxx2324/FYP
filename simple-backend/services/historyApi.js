
const axios = require('axios');
const logger = require('../utils/logger');
const { getCurrentDateString, dayjs } = require('../utils/dateHelper'); 

const HISTORY_API_URL = 'https://app.data.gov.hk/v1/historical-archive/list-files';

const fetchHistoricalFileUrls = async () => {
    let allFileUrls = [];
    let skip = 0;
    const max = 20; 
    let hasMore = true;

    const endDate = dayjs().subtract(1, 'day').format('YYYYMMDD'); 
    
    try {
        while (hasMore) {
            const startDate = dayjs().subtract(8, 'day').format('YYYYMMDD'); 
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
                 
                 
                 
                 
                 
                const urls = data.files.map(file => file.url);
                allFileUrls = allFileUrls.concat(urls);
                skip += data.files.length;
                
                
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


const axios = require('axios');
const logger = require('../utils/logger');

const CKAN_API_URL = 'https://data.gov.hk/tc-data/api/3/action/package_show?id=cfs-foodalert-foodalert';

const fetchRssUrl = async (language = 'tc') => {
    try {
        const response = await axios.get(CKAN_API_URL);
        const data = response.data;

        if (data.success && data.result && data.result.resources) {
            
            const resource = data.result.resources.find(r => {
                const format = r.format.toUpperCase();
                if (format !== 'RSS' && format !== 'XML') return false;
                
                if (language === 'tc') {
                    return r.inLanguage === 'tc' || (r.name && r.name.includes('繁體中文'));
                } else if (language === 'en') {
                    return r.inLanguage === 'en' || (r.name && r.name.includes('English')) || (r.name && r.name.includes('(英文)'));
                } else if (language === 'sc') {
                    return r.inLanguage === 'sc' || (r.name && r.name.includes('簡體中文'));
                }
                return false;
            });
            
            if (resource && resource.url) {
                logger.info(`Successfully fetched ${language.toUpperCase()} RSS/XML URL: ${resource.url}`);
                return resource.url;
            } else {
                
                logger.warn(`No suitable RSS/XML resource found for language: ${language}`);
                return null;
            }
        } else {
            throw new Error('Invalid response structure from CKAN API.');
        }
    } catch (error) {
        logger.error(`Error fetching RSS URL from CKAN API: ${error.message}`);
        throw error;
    }
};

module.exports = {
    fetchRssUrl
};

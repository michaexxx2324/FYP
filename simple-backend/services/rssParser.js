
const xml2js = require('xml2js');
const { formatDate, parseDate } = require('../utils/dateHelper');
const logger = require('../utils/logger');

const parser = new xml2js.Parser();

const parseRss = async (xmlContent, language = 'tc') => {
    try {
        const result = await parser.parseStringPromise(xmlContent);
        
        if (!result.rss || !result.rss.channel || !result.rss.channel[0].item) {
            logger.warn('RSS content seems empty or invalid format.');
            return [];
        }

        const items = result.rss.channel[0].item;
        
        const parsedItems = items.map(item => {
            const title = item.title ? item.title[0] : null;
            const description = item.description ? item.description[0] : null;
            const link = item.link ? item.link[0] : null;
            const pubDate = item.pubDate ? item.pubDate[0] : null;
            const publishDate = formatDate(pubDate);

            
            const productInfo = extractProductInfo(description);

            return {
                title,
                description,
                link,
                pubDate, 
                publishDate, 
                productInfo,
                language 
            };
        });

        return parsedItems;
    } catch (error) {
        logger.error(`Error parsing RSS content: ${error.message}`);
        throw error;
    }
};

const extractProductInfo = (descriptionHtml) => {
    if (!descriptionHtml) return {};

    
    
    const brandMatch = descriptionHtml.match(/<p>(?:品牌|Brand)：(.*?)(?:<\/p>|<br)/i);
    const originMatch = descriptionHtml.match(/<p>(?:來源地|Place of origin)：(.*?)(?:<\/p>|<br)/i);
    const batchMatch = descriptionHtml.match(/<p>(?:批次編號|Batch number|此日期前最佳|Use by|Best before)：(.*?)(?:<\/p>|<br)/i);
    const productMatch = descriptionHtml.match(/<p>(?:產品名稱|Product name)：(.*?)(?:<\/p>|<br)/i);

    return {
        productName: productMatch ? productMatch[1].trim() : null,
        brand: brandMatch ? brandMatch[1].trim() : null,
        origin: originMatch ? originMatch[1].trim() : null,
        batch: batchMatch ? batchMatch[1].trim() : null,
        
    };
};

module.exports = {
    parseRss
};

// simple-backend/services/scraper.js
const axios = require('axios');
const logger = require('../utils/logger');

// Helper to strip HTML tags and decode entities (basic)
const stripHtml = (html) => {
    if (!html) return '';
    // Replace <p>, <br>, </div> with newline
    let text = html.replace(/<(?:p|br|div)[^>]*>/gi, '\n');
    // Remove all other tags
    text = text.replace(/<[^>]+>/g, '');
    // Decode common entities
    text = text.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    // Clean up excessive whitespace
    text = text.replace(/\n\s*\n/g, '\n').trim();
    return text;
};

// Helper to extract content from table rows
const extractTableData = (html) => {
    const data = {};
    // Regex to match row: <tr> <th>Header</th> <td>Content</td> </tr>
    // Using [\s\S] instead of . to match newlines
    const rowRegex = /<tr[^>]*>\s*<th[^>]*>([\s\S]*?)<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/gi;
    
    let match;
    while ((match = rowRegex.exec(html)) !== null) {
        let key = stripHtml(match[1]).trim().replace(/\s+/g, ' '); // Normalize spaces to single space
        let value = stripHtml(match[2]);
        
        // Map keys to standardized property names
        if (/發出日期|Date of issue|Issue Date/i.test(key)) data.issueDate = value;
        else if (/資料來源|Source of information|Source/i.test(key)) data.source = value;
        else if (/食品|Food item|Food Product/i.test(key)) data.foodItem = value;
        else if (/產品名稱及資料|Product name and information|Product Name and Description/i.test(key)) data.productDetails = value;
        else if (/發出警報原因|Reason for issuing the alert|Reason For Issuing Alert/i.test(key)) data.reason = value;
        else if (/食物安全中心採取的行動|Action taken by the Centre for Food Safety/i.test(key)) data.actionTaken = value;
        else if (/給業界的建議|Advice to the trade/i.test(key)) data.adviceToTrade = value;
        else if (/給消費者的建議|Advice to consumers/i.test(key)) data.adviceToConsumers = value;
        else if (/更多資料|More information/i.test(key)) data.moreInfo = value;
    }
    return data;
};

const fetchAlertDetails = async (url) => {
    if (!url) return {};
    try {
        logger.info(`Fetching details from: ${url}`);
        const response = await axios.get(url, {
             timeout: 10000, 
             headers: { 'User-Agent': 'Mozilla/5.0' } // Sometimes needed
        });
        const html = response.data;
        return extractTableData(html);
    } catch (error) {
        logger.error(`Error fetching alert details from ${url}: ${error.message}`);
        return {};
    }
};

module.exports = {
    fetchAlertDetails
};

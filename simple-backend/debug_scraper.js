const { fetchAlertDetails } = require('./services/scraper');

const url = 'http://www.cfs.gov.hk/english/whatsnew/whatsnew_fa/2026_613.html';

(async () => {
    try {
        console.log(`Fetching details for: ${url}`);
        const axios = require('axios');
        const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        console.log("HTML Preview (first 2000 chars):", res.data.substring(0, 2000));
        // Check for specific strings
        console.log("Contains 'issuedate' (case insensitive)?", /issue\s*date/i.test(res.data));
        console.log("Contains 'Date of issue'?", res.data.includes('Date of issue'));
        
        const { fetchAlertDetails } = require('./services/scraper');
        
        // Temporarily redefine fetchAlertDetails here to debug inner logic if needed, 
        // OR just rely on importing it if that logic is correct
        
        const details = await fetchAlertDetails(url);
        console.log("Extracted Details:", JSON.stringify(details, null, 2));
    } catch (e) {
        console.error(e);
    }
})();

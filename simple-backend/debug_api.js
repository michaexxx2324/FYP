const axios = require('axios');

(async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/alerts?lang=tc');
        // Check first item
        if (response.data.data.length > 0) {
            console.log("Keys:", Object.keys(response.data.data[0]));
            console.log("Action Taken:", response.data.data[0].actionTaken);
        } else {
            console.log("No alerts found.");
        }
    } catch (e) {
        console.error(e.message);
    }
})();

// simple-backend/utils/dateHelper.js
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

// Set default timezone to Hong Kong (UTC+8)
dayjs.tz.setDefault("Asia/Hong_Kong");

// Helper function to format date
const formatDate = (dateString, format = 'YYYY-MM-DD') => {
    if (!dateString) return null;
    return dayjs(dateString).tz("Asia/Hong_Kong").format(format);
};

// Helper function to check if a date is within the last 7 days
const isWithinLast7Days = (dateString) => {
    if (!dateString) return false;
    const now = dayjs().tz("Asia/Hong_Kong");
    const date = dayjs(dateString);
    if (!date.isValid()) return false;
    
    // Check if the date is within the last 7 days (including future dates as a safety net against incorrect inputs)
    const diff = now.diff(date, 'day');
    return diff >= 0 && diff <= 7;
};

// Helper function to parse pubDate into dayjs object
const parseDate = (dateString) => {
    return dayjs(dateString).tz("Asia/Hong_Kong");
};

// Get current date string formatted as YYYYMMDD
const getCurrentDateString = () => {
    return dayjs().tz("Asia/Hong_Kong").format('YYYYMMDD');
};

module.exports = {
    formatDate,
    isWithinLast7Days,
    parseDate,
    getCurrentDateString,
    dayjs
};

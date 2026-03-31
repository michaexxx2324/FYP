
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);


dayjs.tz.setDefault("Asia/Hong_Kong");


const formatDate = (dateString, format = 'YYYY-MM-DD') => {
    if (!dateString) return null;
    return dayjs(dateString).tz("Asia/Hong_Kong").format(format);
};


const isWithinLast7Days = (dateString) => {
    if (!dateString) return false;
    const now = dayjs().tz("Asia/Hong_Kong");
    const date = dayjs(dateString);
    if (!date.isValid()) return false;
    
    
    const diff = now.diff(date, 'day');
    return diff >= 0 && diff <= 7;
};


const parseDate = (dateString) => {
    return dayjs(dateString).tz("Asia/Hong_Kong");
};


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

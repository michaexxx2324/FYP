
const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../data/app.log');

const log = (level, message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    
    console.log(logMessage);

    
    fs.appendFile(logFilePath, logMessage + '\n', (err) => {
        if (err) console.error('Failed to write log to file:', err);
    });
};

module.exports = {
    info: (message) => log('INFO', message),
    error: (message) => log('ERROR', message),
    warn: (message) => log('WARN', message)
};

const updateAlerts = require('./updateAlerts');

(async () => {
    console.log("Forcing update of alerts...");
    try {
        await updateAlerts();
        console.log("Update complete.");
        process.exit(0);
    } catch (error) {
        console.error("Update failed:", error);
        process.exit(1);
    }
})();

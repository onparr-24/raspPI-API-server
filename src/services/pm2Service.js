const execCommand = require('../utils/execCommand');
const { APP_CONFIG, MESSAGES, ERRORS } = require('../config/constants');

const restartPM2 = async () => {
    try {
        if (process.env.PM2_HOME) {
            await execCommand(`pm2 restart ${APP_CONFIG.PM2_PROCESS_NAME}`);
            return MESSAGES.PM2_RESTART;
        } else {
            return MESSAGES.PM2_NOT_RUNNING;
        }
    } catch (error) {
        throw new Error(`${ERRORS.PM2_RESTART_FAILED}: ${error.error || error.message}`);
    }
};

module.exports = {
    restartPM2
};

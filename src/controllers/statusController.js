const { getOS } = require('../services/systemService');
const { APP_CONFIG, MESSAGES } = require('../config/constants');

const getStatus = async (req, res) => {
    try {
        res.status(200).json({
            status: MESSAGES.SERVER_RUNNING,
            platform: await getOS(),
            version: APP_CONFIG.VERSION
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    getStatus
};

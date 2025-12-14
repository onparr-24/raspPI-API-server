const { checkForUpdates, pullUpdates, npmInstall } = require('../services/gitService');
const { restartPM2 } = require('../services/pm2Service');
const { MESSAGES, TIMEOUTS } = require('../config/constants');

const checkUpdates = async (req, res) => {
    try {
        const updateInfo = await checkForUpdates();
        res.status(200).json({
            success: true,
            hasUpdates: updateInfo.hasUpdates,
            message: updateInfo.hasUpdates ? MESSAGES.UPDATES_AVAILABLE : MESSAGES.NO_UPDATES,
            gitStatus: updateInfo.status
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const updateServer = async (req, res) => {
    try {
        const updateInfo = await checkForUpdates();

        if (!updateInfo.hasUpdates) {
            return res.status(200).json({
                success: true,
                message: MESSAGES.NO_UPDATES,
                updated: false
            });
        }

        const pullResult = await pullUpdates();

        res.status(200).json({
            success: true,
            message: MESSAGES.UPDATE_SUCCESS,
            updated: true,
            pullResult: pullResult
        });

        setTimeout(async () => {
            try {
                console.log('Running npm install...');
                await npmInstall();
                console.log('Restarting PM2...');
                await restartPM2();
                console.log('Finished Update...');
            } catch (error) {
                console.error('Failed during post-update process:', error.message);
            }
        }, TIMEOUTS.UPDATE_DELAY);

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    checkUpdates,
    updateServer
};

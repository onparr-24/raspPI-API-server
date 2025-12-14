const execCommand = require('../utils/execCommand');
const { GIT_CONFIG, ERRORS } = require('../config/constants');

const checkForUpdates = async () => {
    try {
        await execCommand(`git fetch ${GIT_CONFIG.REMOTE}`);
        const result = await execCommand('git status -uno');

        return {
            hasUpdates: result.includes('Your branch is behind'),
            status: result
        };
    } catch (error) {
        throw new Error(`${ERRORS.UPDATE_CHECK_FAILED}: ${error.error || error.message}`);
    }
};

const pullUpdates = async () => {
    try {
        let pullResult;
        try {
            pullResult = await execCommand(`git pull ${GIT_CONFIG.REMOTE} ${GIT_CONFIG.MAIN_BRANCH}`);
        } catch (error) {
            pullResult = await execCommand(`git pull ${GIT_CONFIG.REMOTE} ${GIT_CONFIG.FALLBACK_BRANCH}`);
        }
        return pullResult;
    } catch (error) {
        throw new Error(`${ERRORS.UPDATE_PULL_FAILED}: ${error.error || error.message}`);
    }
};

const npmInstall = async () => {
    try {
        const result = await execCommand('npm install');
        return result;
    } catch (error) {
        throw new Error(`${ERRORS.NPM_INSTALL_FAILED}: ${error.error || error.message}`);
    }
};

module.exports = {
    checkForUpdates,
    pullUpdates,
    npmInstall
};

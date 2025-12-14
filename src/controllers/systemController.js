const { getDiskSpace, getMemory, getHealth } = require('../services/systemService');


const getStorageInfo = async (req, res) => {
    try {
        const spaceInfo = await getDiskSpace();
        res.status(200).json({
            success: true,
            diskSpace: spaceInfo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const getMemoryInfo = async (req, res) => {
    try {
        const memInfo = await getMemory();
        res.status(200).json({
            success: true,
            memory: memInfo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const getHealthInfo = async (req, res) => {
    try {
        const healthInfo = await getHealth();
        res.status(200).json({
            success: true,
            memory: healthInfo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    getStorageInfo,
    getMemoryInfo,
    getHealthInfo,
};

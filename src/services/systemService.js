const os = require('os');
const checkDiskSpace = require('check-disk-space').default;
const { PLATFORM_NAMES, SYSTEM_PATHS, ERRORS } = require('../config/constants');
const process = require('process');

const getOS = async () => {
    const platform = os.platform();
    return PLATFORM_NAMES[platform] || platform;
};

const getDiskSpace = async () => {
    try {
        const diskPath = process.platform === 'win32' ? SYSTEM_PATHS.WINDOWS_DISK : SYSTEM_PATHS.UNIX_DISK;
        const diskSpace = await checkDiskSpace(diskPath);

        const freeSpaceGB = (diskSpace.free / 1024 / 1024 / 1024).toFixed(2);
        const totalSpaceGB = (diskSpace.size / 1024 / 1024 / 1024).toFixed(2);

        return {
            freeSpaceGB: freeSpaceGB,
            totalSpaceGB: totalSpaceGB
        };
    } catch (error) {
        throw new Error(`${ERRORS.DISK_SPACE_FAILED}: ${error.message}`);
    }
};

const getMemory = async () => {
    try {
        const memoryUsage = process.memoryUsage();
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        
        const usedMemoryGB = (memoryUsage.heapUsed / 1024 / 1024 / 1024).toFixed(2);
        const totalMemoryGB = (totalMemory / 1024 / 1024 / 1024).toFixed(2);
        const freeMemoryGB = (freeMemory / 1024 / 1024 / 1024).toFixed(2);

        return {
            usedMemoryGB: usedMemoryGB,
            totalMemoryGB: totalMemoryGB,
            freeMemoryGB: freeMemoryGB
        };
    } catch (error) {
        throw new Error(`${ERRORS.MEMORY_FAILED}: ${error.message}`);
    }
};

module.exports = {
    getOS,
    getDiskSpace,
    getMemory,
};

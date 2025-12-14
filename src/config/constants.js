// Application configuration constants
const APP_CONFIG = {
    PORT: 3000,
    VERSION: '0.0.12',
    PM2_PROCESS_NAME: 'raspberrypi-api',
    HOSTNAME: 'raspberrypi-2'
};

// Platform mappings
const PLATFORM_NAMES = {
    'win32': 'Windows',
    'darwin': 'Mac OS',
    'linux': 'Linux'
};

// Git configuration
const GIT_CONFIG = {
    MAIN_BRANCH: 'main',
    FALLBACK_BRANCH: 'master',
    REMOTE: 'origin'
};

// System paths
const SYSTEM_PATHS = {
    WINDOWS_DISK: 'C:/',
    UNIX_DISK: '/'
};

// API response messages
const MESSAGES = {
    SERVER_RUNNING: 'Server is running',
    NO_UPDATES: 'No updates available',
    UPDATES_AVAILABLE: 'Updates available',
    UPDATE_SUCCESS: 'Updates pulled successfully. Restarting server...',
    PM2_RESTART: 'PM2 restart initiated',
    PM2_NOT_RUNNING: 'Not running under PM2, manual restart required'
};

// Timeouts (in milliseconds)
const TIMEOUTS = {
    UPDATE_DELAY: 1000
};

// Error messages
const ERRORS = {
    UPDATE_CHECK_FAILED: 'Failed to check for updates',
    UPDATE_PULL_FAILED: 'Failed to pull updates',
    NPM_INSTALL_FAILED: 'Failed to install',
    PM2_RESTART_FAILED: 'Failed to restart PM2',
    DISK_SPACE_FAILED: 'Failed to get disk space',
    MEMORY_FAILED: 'Failed to get memory'
};

module.exports = {
    APP_CONFIG,
    PLATFORM_NAMES,
    GIT_CONFIG,
    SYSTEM_PATHS,
    MESSAGES,
    TIMEOUTS,
    ERRORS
};

const os = require('os');
const checkDiskSpace = require('check-disk-space').default;
const { PLATFORM_NAMES, SYSTEM_PATHS, ERRORS } = require('../config/constants');
const process = require('process');
const execCommand = require('../utils/execCommand');

const getOS = async () => {
    const platform = os.platform();
    return PLATFORM_NAMES[platform] || platform;
};

const checkAdminPrivileges = async () => {
    try {
        if (process.platform === 'win32') {
            // Use Windows-specific method to check admin privileges
            const result = await execCommand('net session 2>nul');
            if (result.includes('access is denied') || result.includes('Access is denied')) {
                console.log('Warning: Running without administrator privileges');
                console.log('Some health checks may not work properly');
                return false;
            } else {
                console.log('Running with administrator privileges');
                return true;
            }
        } else {
            // For Linux/Unix/macOS systems, check if running as root
            const result = await execCommand('id -u');
            const isRoot = result.trim() === '0';
            if (isRoot) {
                console.log('Running with root/sudo privileges');
                return true;
            } else {
                console.log('Warning: Running without root/sudo privileges');
                console.log('Some health checks may not work properly on macOS/Linux');
                return false;
            }
        }
    } catch (error) {
        console.log('Could not determine admin status, assuming non-admin');
        return false;
    }
}

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

const getHealth = async () => {
    try {
        const isAdmin = await checkAdminPrivileges();
        if (process.platform === 'win32') {
            // Use basic WMIC commands that don't require admin privileges
            const diskInfo = await execCommand('wmic diskdrive get model,size,status,mediatype,interfacetype');
            const logicalDisk = await execCommand('wmic logicaldisk get caption,size,freespace,filesystem');
            
            // Try different methods to get disk health information
            let smartStatus = 'Not available';
            let diskHealth = 'Not available';
            
            if (isAdmin) {
                try {
                    // Try PowerShell Get-PhysicalDisk for modern systems
                    diskHealth = await execCommand('powershell "Get-PhysicalDisk | Select-Object DeviceID,MediaType,HealthStatus,OperationalStatus | Format-Table -AutoSize"');
                } catch (error) {
                    try {
                        // Fallback to WMIC diskdrive with health status
                        diskHealth = await execCommand('wmic diskdrive get model,status,size,mediatype,serialnumber');
                    } catch (error2) {
                        // Final fallback
                        diskHealth = 'PowerShell and WMIC health commands not available';
                    }
                }
                
                try {
                    // Try to get SMART attributes via PowerShell
                    smartStatus = await execCommand('powershell "Get-WmiObject -Namespace root\\wmi -Class MSStorageDriver_FailurePredictStatus | Select-Object InstanceName,PredictFailure,Reason | Format-Table -AutoSize"');
                } catch (error) {
                    try {
                        // Alternative SMART check
                        smartStatus = await execCommand('powershell "Get-WmiObject -Class Win32_DiskDrive | Select-Object Model,Status,Size | Format-Table -AutoSize"');
                    } catch (error2) {
                        smartStatus = 'SMART data not accessible on this system';
                    }
                }
            } else {
                smartStatus = 'Administrator privileges required for SMART data';
                diskHealth = 'Administrator privileges required for detailed health data';
            }
            
            return {
                diskInfo: diskInfo,
                logicalDisk: logicalDisk,
                diskHealth: diskHealth,
                smartStatus: smartStatus,
                adminPrivileges: isAdmin,
                platform: 'Windows',
                timestamp: new Date().toISOString()
            };
        } else if (process.platform === 'darwin') {
            // macOS implementation
            const healthData = [];
            
            try {
                // Get disk information using diskutil
                const diskList = await execCommand('diskutil list');
                
                // Get SMART status for each physical disk
                const diskInfo = await execCommand('system_profiler SPSerialATADataType SPNVMeDataType');
                
                // Try to get SMART status using smartctl if available
                let smartctlAvailable = false;
                try {
                    await execCommand('which smartctl');
                    smartctlAvailable = true;
                } catch (error) {
                    // smartctl not available
                }
                
                if (smartctlAvailable) {
                    try {
                        // Get list of drives that support SMART
                        const smartDevices = await execCommand('smartctl --scan');
                        const devices = smartDevices.split('\n').filter(line => line.trim());
                        
                        for (const deviceLine of devices) {
                            const device = deviceLine.split(' ')[0];
                            if (device) {
                                try {
                                    const smartOutput = await execCommand(`smartctl -a ${device}`);
                                    const healthSummary = await execCommand(`smartctl -H ${device}`);
                                    
                                    healthData.push({
                                        device: device,
                                        smartData: smartOutput,
                                        healthSummary: healthSummary
                                    });
                                } catch (error) {
                                    // Skip devices that don't support SMART
                                }
                            }
                        }
                    } catch (error) {
                        // SMART scan failed
                    }
                }
                
                // Get disk usage and temperature if available
                let diskTemperature = 'Not available';
                try {
                    // Try to get disk temperature (requires additional tools)
                    diskTemperature = await execCommand('sudo smartctl -A /dev/disk0 | grep Temperature');
                } catch (error) {
                    // Temperature not available
                }
                
                return {
                    diskList: diskList,
                    diskInfo: diskInfo,
                    devices: healthData,
                    diskTemperature: diskTemperature,
                    smartctlAvailable: smartctlAvailable,
                    adminPrivileges: isAdmin,
                    platform: 'macOS',
                    timestamp: new Date().toISOString(),
                    note: smartctlAvailable ? 'Install smartctl with: brew install smartmontools' : 'For detailed SMART data, install smartmontools: brew install smartmontools'
                };
            } catch (error) {
                return {
                    error: `macOS disk health check failed: ${error.message}`,
                    adminPrivileges: isAdmin,
                    platform: 'macOS',
                    timestamp: new Date().toISOString(),
                    note: 'For detailed SMART data, install smartmontools: brew install smartmontools'
                };
            }
        } else {
            // Linux implementation (including Raspberry Pi)
            const healthData = [];
            let deviceList = 'No devices found';
            let smartctlAvailable = false;
            
            try {
                // Check if smartctl is available
                await execCommand('which smartctl');
                smartctlAvailable = true;
            } catch (error) {
                // smartctl not available
            }
            
            try {
                // Get basic device information
                deviceList = await execCommand('lsblk -d -o NAME,SIZE,TYPE,MODEL');
            } catch (error) {
                try {
                    // Fallback to simpler command
                    deviceList = await execCommand('lsblk');
                } catch (error2) {
                    deviceList = 'lsblk command failed';
                }
            }
            
            if (smartctlAvailable) {
                try {
                    // Try to scan for SMART devices
                    const smartScan = await execCommand('smartctl --scan');
                    const smartDevices = smartScan.split('\n').filter(line => line.trim() && !line.startsWith('#'));
                    
                    for (const deviceLine of smartDevices) {
                        const device = deviceLine.split(' ')[0];
                        if (device) {
                            try {
                                const smartOutput = await execCommand(`smartctl -a ${device}`);
                                const healthSummary = await execCommand(`smartctl -H ${device}`);
                                
                                healthData.push({
                                    device: device,
                                    smartData: smartOutput,
                                    healthSummary: healthSummary
                                });
                            } catch (error) {
                                // Skip devices that don't support SMART or require sudo
                                healthData.push({
                                    device: device,
                                    error: `SMART not accessible: ${error.message}`,
                                    note: 'May require sudo privileges'
                                });
                            }
                        }
                    }
                } catch (error) {
                    // Fallback: try common device paths
                    const commonDevices = ['/dev/sda', '/dev/sdb', '/dev/nvme0n1', '/dev/mmcblk0'];
                    
                    for (const device of commonDevices) {
                        try {
                            const healthSummary = await execCommand(`smartctl -H ${device}`);
                            const smartOutput = await execCommand(`smartctl -a ${device}`);
                            
                            healthData.push({
                                device: device,
                                smartData: smartOutput,
                                healthSummary: healthSummary
                            });
                        } catch (error) {
                            // Device doesn't exist or doesn't support SMART
                        }
                    }
                }
            }
            
            // Get additional system information
            let cpuTemp = 'Not available';
            let diskUsage = 'Not available';
            
            try {
                // Try to get CPU temperature (common on Raspberry Pi)
                cpuTemp = await execCommand('cat /sys/class/thermal/thermal_zone0/temp');
                if (cpuTemp && !isNaN(cpuTemp.trim())) {
                    cpuTemp = `${(parseInt(cpuTemp.trim()) / 1000).toFixed(1)}°C`;
                }
            } catch (error) {
                try {
                    // Alternative temperature command
                    cpuTemp = await execCommand('vcgencmd measure_temp');
                } catch (error2) {
                    cpuTemp = 'Temperature sensor not accessible';
                }
            }
            
            try {
                diskUsage = await execCommand('df -h');
            } catch (error) {
                diskUsage = 'Disk usage command failed';
            }
            
            return { 
                devices: healthData,
                deviceList: deviceList,
                cpuTemperature: cpuTemp,
                diskUsage: diskUsage,
                smartctlAvailable: smartctlAvailable,
                adminPrivileges: isAdmin,
                platform: 'Linux',
                timestamp: new Date().toISOString(),
                note: smartctlAvailable ? 
                    (isAdmin ? 'SMART monitoring active' : 'Some SMART features may require sudo') :
                    'For SMART monitoring: sudo apt-get install smartmontools'
            };
        }
    } catch (error) {
        throw new Error(`${ERRORS.HEALTH_CHECK_FAILED}: ${error.message}`);
    }
};

module.exports = {
    getOS,
    getDiskSpace,
    getMemory,
    getHealth,
};

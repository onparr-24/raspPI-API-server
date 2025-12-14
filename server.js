const express = require('express');
const app = express();
const PORT = 3000;
const os = require('os');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');


const getOS = async () => {
    const platform = os.platform();

    switch(platform) {
        case 'win32':
            return 'Windows';
        case 'darwin':
            return 'Mac OS';
        case 'linux':
            return 'Linux'
        default:
            return platform;
    }
}

const execCommand = (command) => {
    return new Promise((resolve,reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject({error: error.message, stderr});
            } else {
                resolve(stdout.trim());
            }
        });
    });
};

const checkForUpdates = async () => {
    try {
        await execCommand('git fetch origin');

        const result = await execCommand('git status -uno');

        return {
            hasUpdates: result.includes('Your branch is behind'),
            status: result
        };
    } catch (error) {
        throw new Error(`Failed to check for updates: ${error.error || error.message}`);
    }
}

const pullUpdates = async () => {
    try {
        const pullResult = await execCommand('git pull origin main');
        return pullResult;
    } catch (error) {
        throw new Error(`Failed to pull updates: ${error.error || error.message}`);
    }
}

app.get('/api/status', async (req, res) => {
  res.status(200).json({ 
    status: 'Server is running',
    platform: await getOS()
  });
});

app.get('/api/check-updates', async (req, res) => {
    try {
        const updateInfo = await checkForUpdates();
        res.status(200).json({
            success: true,
            hasUpdates: updateInfo.hasUpdates,
            message: updateInfo.hasUpdates ? 'Updates available' : 'No updates available',
            gitStatus: updateInfo.status  
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/update', async (req, res) => {
    try {
        const updateInfo = await checkForUpdates();

        if(!updateInfo.hasUpdates) {
            return res.status(200).json({
                success: true,
                message: 'No updates available.',
                updated: false
            });
        }

        const pullResult = await pullUpdates();

        res.status(200).json({
            success: true,
            message: 'Updates pulled successfully.',
            updated: true,
            pullResult: pullResult
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.listen(PORT, '0.0.0.0', () => {
  const hostname = os.hostname();
  const networkInterfaces = os.networkInterfaces();
  
  // Get the first non-internal IPv4 address
  let localIP = 'localhost';
  for (const name of Object.keys(networkInterfaces)) {
    for (const net of networkInterfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        localIP = net.address;
        break;
      }
    }
    if (localIP !== 'localhost') break;
  }
  
  console.log(`Hostname: ${hostname}`);
  console.log(`API server listening at http://localhost:${PORT}/api/status`);
  console.log(`Also accessible at http://${hostname}.local:${PORT}/api/status`);
  console.log(`Or via IP: http://${localIP}:${PORT}/api/status`);
  console.log(`Server bound to all interfaces (0.0.0.0:${PORT})`);
});

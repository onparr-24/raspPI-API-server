const express = require('express');
const app = express();
const PORT = 3000;
const os = require('os')

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

app.get('/api/status', async (req, res) => {
  res.status(200).json({ 
    status: 'Server is running',
    platform: await getOS()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server listening at http://localhost:${PORT}`);
});

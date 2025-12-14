const express = require('express');
const os = require('os');
const { APP_CONFIG } = require('./src/config/constants');
const apiRoutes = require('./src/routes');

const app = express();

// Use API routes
app.use('/api', apiRoutes);

app.listen(APP_CONFIG.PORT, '0.0.0.0', () => {
  const hostname = os.hostname();
  const networkInterfaces = os.networkInterfaces();
  
  // Get IPv4 and IPv6 addresses
  let ipv4Address = null;
  let ipv6Address = null;
  
  for (const name of Object.keys(networkInterfaces)) {
    for (const net of networkInterfaces[name]) {
      if (!net.internal) {
        if (net.family === 'IPv4' && !ipv4Address) {
          ipv4Address = net.address;
        }
        if (net.family === 'IPv6' && !ipv6Address && !net.address.startsWith('fe80')) {
          ipv6Address = net.address;
        }
      }
    }
  }
  
  console.log(`Hostname: ${hostname}`);
  console.log(`API server listening at:`);
  console.log(`  - http://localhost:${APP_CONFIG.PORT}/api/status`);
  console.log(`  - http://${hostname}.local:${APP_CONFIG.PORT}/api/status`);
  
  if (ipv4Address) {
    console.log(`  - http://${ipv4Address}:${APP_CONFIG.PORT}/api/status (IPv4)`);
  }
  
  console.log(`Server bound to all interfaces (0.0.0.0:${APP_CONFIG.PORT})`);
  console.log(`\nTry these URLs from your iPhone:`);
  console.log(`  1. http://${hostname}.local:${APP_CONFIG.PORT}/api/status`);
  if (ipv4Address) {
    console.log(`  2. http://${ipv4Address}:${APP_CONFIG.PORT}/api/status`);
  }
});

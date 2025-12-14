const express = require('express');
const statusRoutes = require('./status');
const systemRoutes = require('./system');
const updateRoutes = require('./update');

const router = express.Router();

// Mount routes at their respective paths
router.use('/', statusRoutes);      // /api/status
router.use('/', systemRoutes);      // /api/storage, /api/memory  
router.use('/', updateRoutes);      // /api/check-updates, /api/update

module.exports = router;

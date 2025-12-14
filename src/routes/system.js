const express = require('express');
const { getStorageInfo, getMemoryInfo, getHealthInfo } = require('../controllers/systemController');

const router = express.Router();

router.get('/storage', getStorageInfo);
router.get('/memory', getMemoryInfo);
router.get('/health', getHealthInfo);

module.exports = router;

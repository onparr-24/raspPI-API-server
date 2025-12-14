const express = require('express');
const { getStorageInfo, getMemoryInfo } = require('../controllers/systemController');

const router = express.Router();

router.get('/storage', getStorageInfo);
router.get('/memory', getMemoryInfo);

module.exports = router;

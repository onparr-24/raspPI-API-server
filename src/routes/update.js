const express = require('express');
const { checkUpdates, updateServer } = require('../controllers/updateController');

const router = express.Router();

router.get('/check-updates', checkUpdates);
router.post('/update', updateServer);

module.exports = router;

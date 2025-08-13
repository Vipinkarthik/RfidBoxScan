const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');

router.post('/', scanController.createScan);
router.get('/', scanController.getScans);

module.exports = router;

const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.post('/scan-qr', studentController.scanQRCode);

module.exports = router;
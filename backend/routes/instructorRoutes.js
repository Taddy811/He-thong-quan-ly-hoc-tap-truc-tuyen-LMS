const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorController');

// Khai báo các đường dẫn API
router.post('/start', instructorController.startSession);
router.get('/qr/:sessionId', instructorController.generateQR);
router.put('/end/:sessionId', instructorController.endSession);
router.get('/history/:instructorId', instructorController.getTeachingHistory);

module.exports = router;
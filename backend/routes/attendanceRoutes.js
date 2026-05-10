const express = require('express');
const router = express.Router();
const { getAttendance, saveAttendance } = require('../controllers/attendanceController');

router.get('/', getAttendance);
router.post('/', saveAttendance);

module.exports = router;
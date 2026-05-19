const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


router.post('/update-profile', userController.updateProfile);
router.get('/instructor/history/:instructorId', userController.getInstructorSalaryHistory);

module.exports = router;
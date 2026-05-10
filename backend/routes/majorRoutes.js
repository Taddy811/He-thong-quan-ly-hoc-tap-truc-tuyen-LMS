const express = require('express');
const router = express.Router();
const { getMajors, createMajor, updateMajor, deleteMajor } = require('../controllers/majorController');

router.get('/', getMajors);
router.post('/', createMajor);
router.put('/:id', updateMajor);
router.delete('/:id', deleteMajor);

module.exports = router;
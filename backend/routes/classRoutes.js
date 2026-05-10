const express = require('express');
const router = express.Router();
const { getClasses, createClass, updateClass, deleteClass } = require('../controllers/classController');

router.get('/', getClasses);
router.post('/', createClass);
router.put('/:id', updateClass);
router.delete('/:id', deleteClass);

module.exports = router;
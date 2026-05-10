const express = require('express');
const router = express.Router();
const { getSessions, createSession, updateSession, deleteSession } = require('../controllers/sessionController');

router.get('/', getSessions);
router.post('/', createSession);
router.put('/:id', updateSession);
router.delete('/:id', deleteSession);

module.exports = router;
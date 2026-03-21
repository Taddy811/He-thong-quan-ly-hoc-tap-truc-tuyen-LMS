const Session = require('../models/Session');

const getSessions = async (req, res) => {
  try {
    // Sắp xếp tăng dần theo thời gian tạo để STT buổi học đi từ 1, 2, 3...
    const sessions = await Session.find().sort({ createdAt: 1 });
    res.status(200).json(sessions);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const createSession = async (req, res) => {
  try {
    const session = await Session.create(req.body);
    res.status(201).json(session);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const updateSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(session);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const deleteSession = async (req, res) => {
  try {
    await Session.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Đã xóa buổi học' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

module.exports = { getSessions, createSession, updateSession, deleteSession };
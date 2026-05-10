const Subject = require('../models/Subject');

const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ createdAt: -1 });
    res.status(200).json(subjects);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const createSubject = async (req, res) => {
  try {
    const { code, name, description, status } = req.body; // Đã xóa englishName
    const existing = await Subject.findOne({ code });
    if (existing) return res.status(400).json({ message: 'Mã môn học đã tồn tại!' });
    
    const subject = await Subject.create({ code, name, description, status }); // Đã xóa englishName
    res.status(201).json(subject);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(subject);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const deleteSubject = async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Đã xóa môn học' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

module.exports = { getSubjects, createSubject, updateSubject, deleteSubject };
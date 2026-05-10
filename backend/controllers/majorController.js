const Major = require('../models/Major');

const getMajors = async (req, res) => {
  try {
    const majors = await Major.find().sort({ createdAt: -1 });
    res.status(200).json(majors);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const createMajor = async (req, res) => {
  try {
    const { code, name, description, status } = req.body;
    const existing = await Major.findOne({ code });
    if (existing) return res.status(400).json({ message: 'Mã chuyên ngành đã tồn tại!' });
    const major = await Major.create({ code, name, description, status });
    res.status(201).json(major);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const updateMajor = async (req, res) => {
  try {
    const major = await Major.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(major);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const deleteMajor = async (req, res) => {
  try {
    await Major.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Đã xóa chuyên ngành' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

module.exports = { getMajors, createMajor, updateMajor, deleteMajor };
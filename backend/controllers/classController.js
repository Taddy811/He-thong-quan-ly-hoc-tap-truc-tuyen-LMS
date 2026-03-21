const Class = require('../models/Class');

const getClasses = async (req, res) => {
  try {
    const classes = await Class.find().sort({ createdAt: -1 });
    res.status(200).json(classes);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const createClass = async (req, res) => {
  try {
    const existing = await Class.findOne({ name: req.body.name });
    if (existing) return res.status(400).json({ message: 'Tên lớp học đã tồn tại!' });
    const newClass = await Class.create(req.body);
    res.status(201).json(newClass);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const updateClass = async (req, res) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedClass);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const deleteClass = async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Đã xóa lớp học' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

module.exports = { getClasses, createClass, updateClass, deleteClass };
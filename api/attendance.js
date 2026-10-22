const connectToDatabase = require('../db');
const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  name: String,
  date: Date,
  status: String
}, { collection: 'daily_attendance', timestamps: true });

const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectToDatabase();
    if (req.method === 'GET') {
      const records = await Attendance.find({}).sort({ date: -1 });
      return res.status(200).json(records);
    }
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Database connection failed' });
  }
};

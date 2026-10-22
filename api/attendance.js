
const connectToDatabase = require('../db');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    await connectToDatabase();

    const db = require('mongoose').connection.db;

    const records = await db
      .collection('daily_attendance')
      .find({})
      .sort({ _id: -1 })
      .toArray();

    return res.status(200).json(records);
  } catch (error) {
    console.error('Attendance API error:', error);

    return res.status(500).json({
      error: 'Failed to retrieve attendance records'
    });
  }
};

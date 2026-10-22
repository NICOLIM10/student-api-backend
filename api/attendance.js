const connectToDatabase = require('../db');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectToDatabase();
    const db = require('mongoose').connection.db;

    if (req.method === 'GET') {
      const records = await db.collection('daily_attendance').find({}).sort({ _id: -1 }).toArray();
      return res.status(200).json(records);
    }

    if (req.method === 'DELETE') {
      const { ObjectId } = require('mongodb');
      const id = req.query.id;
      await db.collection('daily_attendance').deleteOne({ _id: new ObjectId(id) });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Attendance API error:', error);
    return res.status(500).json({ error: 'Failed to retrieve attendance records' });
  }
};

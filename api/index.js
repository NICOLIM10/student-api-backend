const connectToDatabase = require('../db');
const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema({
  title: String,
  content: String
}, { timestamps: true });

const Record = mongoose.models.Record || mongoose.model('Record', RecordSchema);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      const records = await Record.find({}).sort({ createdAt: -1 });
      return res.status(200).json(records);
    }

    if (req.method === 'POST') {
      const newRecord = await Record.create(req.body);
      return res.status(201).json(newRecord);
    }

    // Handle deleting data (DELETE)
    if (req.method === 'DELETE') {
      const id = req.query.id || (req.body && req.body.id);
      await Record.findByIdAndDelete(id);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Database connection failed' });
  }
};

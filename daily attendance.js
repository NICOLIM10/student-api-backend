// Drop into the backend repo (student-api-backend) as api/daily_attendance.js, then redeploy.
// Assumes Mongoose and the same env var your existing /api route uses (MONGODB_URI here; rename if yours differs).
const mongoose = require('mongoose');

// cache the connection across serverless invocations
let conn = global._mongoConn;
async function connect() {
  if (!conn) conn = global._mongoConn = mongoose.connect(process.env.MONGODB_URI, { dbName: 'daily_attendance' }); // db name from your Compass screenshot
  return conn;
}

// strict:false = read whatever fields exist; 3rd arg pins the collection name exactly
const Attendance = mongoose.models.DailyAttendance ||
  mongoose.model('DailyAttendance', new mongoose.Schema({}, { strict: false }), 'daily_attendance');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');           // tighten to your site's origin once deployed
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await connect();
    const docs = await Attendance.find().sort({ _id: -1 }).limit(1000).lean();
    res.status(200).json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to read daily_attendance' });
  }
};


const connectToDatabase = require('../db');
const mongoose = require('mongoose');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Accept'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectToDatabase();

    const db = mongoose.connection.db;
    const collection = db.collection('daily_attendance');

    if (req.method === 'GET') {
      const records = await collection
        .find({})
        .sort({ date: -1, _id: -1 })
        .toArray();

      return res.status(200).json(records);
    }

    if (req.method === 'POST') {
      const {
        student_id,
        student_name,
        subject_name,
        section,
        date,
        status
      } = req.body || {};

      if (
        !student_id?.trim() ||
        !student_name?.trim() ||
        !subject_name?.trim() ||
        !section?.trim()
      ) {
        return res.status(400).json({
          error: 'Student ID, name, subject, and section are required.'
        });
      }

      const validStatuses = ['Present', 'Absent', 'Late'];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: 'Status must be Present, Absent, or Late.'
        });
      }

      const attendanceDate = date ? new Date(date) : new Date();

      if (Number.isNaN(attendanceDate.getTime())) {
        return res.status(400).json({
          error: 'Invalid attendance date.'
        });
      }

      const doc = {
        student_id: student_id.trim(),
        student_name: student_name.trim(),
        subject_name: subject_name.trim(),
        section: section.trim(),
        date: attendanceDate,
        status,
        created_at: new Date()
      };

      const result = await collection.insertOne(doc);

      return res.status(201).json({
        ...doc,
        _id: result.insertedId
      });
    }

    if (req.method === 'PUT') {
      const id = req.query.id;

      if (!id || !mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          error: 'A valid attendance record ID is required.'
        });
      }

      const updates = req.body || {};
      const allowedFields = [
        'student_id',
        'student_name',
        'subject_name',
        'section',
        'date',
        'status'
      ];

      const safeUpdates = {};

      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          safeUpdates[field] = updates[field];
        }
      }

      if (safeUpdates.status !== undefined) {
        if (!['Present', 'Absent', 'Late'].includes(safeUpdates.status)) {
          return res.status(400).json({
            error: 'Status must be Present, Absent, or Late.'
          });
        }
      }

      if (safeUpdates.date !== undefined) {
        const date = new Date(safeUpdates.date);

        if (Number.isNaN(date.getTime())) {
          return res.status(400).json({
            error: 'Invalid attendance date.'
          });
        }

        safeUpdates.date = date;
      }

      if (Object.keys(safeUpdates).length === 0) {
        return res.status(400).json({
          error: 'No valid fields provided for updating.'
        });
      }

      const result = await collection.updateOne(
        { _id: new mongoose.Types.ObjectId(id) },
        { $set: safeUpdates }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          error: 'Attendance record not found.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Attendance updated successfully.'
      });
    }

    if (req.method === 'DELETE') {
      const id = req.query.id;

      if (!id || !mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          error: 'A valid attendance record ID is required.'
        });
      }

      const result = await collection.deleteOne({
        _id: new mongoose.Types.ObjectId(id)
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          error: 'Attendance record not found.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Attendance deleted successfully.'
      });
    }

    res.setHeader('Allow', 'GET, POST, PUT, DELETE, OPTIONS');

    return res.status(405).json({
      error: 'Method not allowed.'
    });
  } catch (error) {
    console.error('Attendance API error:', error);

    return res.status(500).json({
      error: 'Failed to process attendance request.'
    });
  }
};

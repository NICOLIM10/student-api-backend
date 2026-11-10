const connectToDatabase = require('../db');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || 'uphsd2024';

function hashPassword(password) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(password).digest('hex');
}

const VALID_PASSWORD_HASH = hashPassword(ADMIN_PASSWORD_HASH);

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;
    
    if (username === ADMIN_USERNAME && hashPassword(password) === VALID_PASSWORD_HASH) {
      const token = Buffer.from(JSON.stringify({ 
        user: 'admin', 
        exp: Date.now() + 24 * 60 * 60 * 1000 
      })).toString('base64');
      
      return res.status(200).json({ 
        success: true, 
        token,
        message: 'Login successful' 
      });
    }
    
    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
};
const mongoose = require('mongoose');

const getHealth = (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus =
    dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';

  res.status(200).json({
    success: true,
    message: 'CivicPulse API is running',
    db: dbStatus,
  });
};

module.exports = { getHealth };

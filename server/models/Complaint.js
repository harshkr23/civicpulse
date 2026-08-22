const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
  incident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident',
  },
  image: {
    type: String,
  },
  category: {
    type: String,
    trim: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
  },
  summary: {
    type: String,
    trim: true,
  },
  suggestedDepartment: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Complaint', complaintSchema);

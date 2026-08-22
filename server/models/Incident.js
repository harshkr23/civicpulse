const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  category: { type: String, required: true, trim: true },
  summary: { type: String, required: true, trim: true },
  suggestedDepartment: { type: String, trim: true },
  location: { type: String, trim: true },
  latitude: Number,
  longitude: Number,
  keywords: [String],
  reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' }],
  reportCount: { type: Number, default: 1 },
  status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
  lastReportedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Incident', incidentSchema);

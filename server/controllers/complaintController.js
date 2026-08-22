const Complaint = require('../models/Complaint');
const { analyzeComplaint } = require('../services/geminiService');
const { clusterComplaint } = require('../services/incidentService');

const createComplaint = async (req, res) => {
  try {
    const { description, location, latitude, longitude, image } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'description is required',
      });
    }

    const analysis = await analyzeComplaint(description, image);

    const complaint = await Complaint.create({
      description: description.trim(),
      location: location?.trim(),
      latitude,
      longitude,
      image,
      category: analysis.category,
      severity: analysis.severity,
      summary: analysis.summary,
      suggestedDepartment: analysis.suggestedDepartment,
    });

    const incident = await clusterComplaint({ complaint, analysis });
    complaint.incident = incident._id;
    await complaint.save();

    res.status(201).json({ success: true, data: { ...complaint.toObject(), incident } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().populate('incident').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Complaint deleted',
      data: complaint,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
};

const { analyzeComplaint, generateCivicReport, transcribeComplaintAudio } = require('../services/geminiService');

const analyzeComplaintHandler = async (req, res) => {
  try {
    const { description, image } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'description is required',
      });
    }

    const analysis = await analyzeComplaint(description, image);

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const generateCivicReportHandler = async (req, res) => {
  try {
    const report = await generateCivicReport();
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const transcribeAudioHandler = async (req, res) => {
  try {
    const transcript = await transcribeComplaintAudio(req.body.audio);
    res.status(200).json({ success: true, data: { transcript } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { analyzeComplaintHandler, generateCivicReportHandler, transcribeAudioHandler };

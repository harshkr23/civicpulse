const express = require('express');
const { analyzeComplaintHandler, generateCivicReportHandler, transcribeAudioHandler } = require('../controllers/aiController');

const router = express.Router();

router.post('/analyze', analyzeComplaintHandler);
router.post('/report', generateCivicReportHandler);
router.post('/transcribe', transcribeAudioHandler);

module.exports = router;

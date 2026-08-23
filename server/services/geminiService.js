const { GoogleGenerativeAI } = require('@google/generative-ai');
const Complaint = require('../models/Complaint');

const getApiKey = () => {
  const key = process.env.GEMINI_API_KEY || process.env.gemini_API_KEY;

  if (!key) {
    throw new Error('GEMINI_API_KEY is not defined in .env');
  }

  return key;
};

const responseSchema = {
  type: 'object',
  properties: {
    category: {
      type: 'string',
      description: 'Issue category such as Roads, Sanitation, Utilities, Public Safety',
    },
    severity: {
      type: 'string',
      enum: ['low', 'medium', 'high', 'critical'],
      description: 'Urgency level of the complaint',
    },
    summary: {
      type: 'string',
      description: 'One-sentence summary of the complaint',
    },
    suggestedDepartment: {
      type: 'string',
      description: 'City department that should handle this issue',
    },
  },
  required: ['category', 'severity', 'summary', 'suggestedDepartment'],
};

const imagePartFromDataUrl = (image) => {
  if (!image?.startsWith('data:image/')) return null;

  const match = image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;

  return {
    inlineData: {
      mimeType: match[1],
      data: match[2],
    },
  };
};

const audioPartFromDataUrl = (audio) => {
  // Match audio MIME types including codec suffixes like audio/webm;codecs=opus
  const match = audio?.match(/^data:(audio\/[^;,]+(?:;[^,]*)?);base64,(.+)$/);
  if (!match) throw new Error('A valid audio recording is required');

  // Strip codec suffix from mimeType so the API accepts it cleanly
  const mimeType = match[1].split(';')[0];
  return { inlineData: { mimeType, data: match[2] } };
};

const analyzeComplaint = async (description, image) => {
  if (!description || !description.trim()) {
    throw new Error('Complaint description is required');
  }

  const genAI = new GoogleGenerativeAI(getApiKey());
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.6-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema,
    },
  });

  const prompt = `You are CivicPulse AI, a civic issue triage assistant.

Analyze this citizen complaint${image ? ' and the attached photo' : ''} and return structured JSON only.

Complaint:
"${description.trim()}"

Guidelines:
- category: choose a clear civic issue category
- severity: low, medium, high, or critical based on public impact and safety
- summary: concise one-sentence summary
- suggestedDepartment: realistic municipal department name`;

  const imagePart = imagePartFromDataUrl(image);
  const content = imagePart ? [{ text: prompt }, imagePart] : prompt;
  const result = await model.generateContent(content);
  const text = result.response.text();

  return JSON.parse(text);
};

const civicReportSchema = {
  type: 'object',
  properties: {
    headline: { type: 'string' },
    complaintsReceived: { type: 'number' },
    mostReported: { type: 'string' },
    criticalIssues: { type: 'number' },
    mostAffectedArea: { type: 'string' },
    recommendedPriorities: { type: 'array', items: { type: 'string' } },
  },
  required: ['headline', 'complaintsReceived', 'mostReported', 'criticalIssues', 'mostAffectedArea', 'recommendedPriorities'],
};

const generateCivicReport = async () => {
  const complaints = await Complaint.find().lean();
  const countBy = (field) => complaints.reduce((counts, complaint) => {
    const key = complaint[field] || 'Unspecified';
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
  const mostFrequent = (counts, fallback) => Object.entries(counts)
    .sort((first, second) => second[1] - first[1])[0]?.[0] || fallback;
  const categories = countBy('category');
  const locations = countBy('location');
  const priorities = Object.entries(categories).sort((first, second) => second[1] - first[1]).slice(0, 3).map(([name]) => name);
  const facts = {
    complaintsReceived: complaints.length,
    mostReported: mostFrequent(categories, 'No reports yet'),
    criticalIssues: complaints.filter((complaint) => complaint.severity === 'critical').length,
    mostAffectedArea: mostFrequent(locations, 'No location data'),
    recommendedPriorities: priorities.length ? priorities : ['No priorities yet'],
  };
  const genAI = new GoogleGenerativeAI(getApiKey());
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.6-flash',
    generationConfig: { responseMimeType: 'application/json', responseSchema: civicReportSchema },
  });
  const prompt = `You are CivicPulse AI, preparing a concise municipal dashboard report. Return JSON only. Use these verified live figures exactly: ${JSON.stringify(facts)}. Set the headline to TODAY'S CIVIC REPORT.`;
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
};

const transcribeComplaintAudio = async (audio) => {
  const genAI = new GoogleGenerativeAI(getApiKey());
  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
  const result = await model.generateContent([
    { text: 'Transcribe this civic complaint exactly as spoken. Return only the transcript, with no labels or commentary.' },
    audioPartFromDataUrl(audio),
  ]);
  return result.response.text().trim();
};

module.exports = { analyzeComplaint, generateCivicReport, transcribeComplaintAudio };

const Incident = require('../models/Incident');

const stopWords = new Set(['a', 'an', 'the', 'at', 'near', 'outside', 'on', 'in', 'of', 'and', 'to', 'large', 'big']);

const extractKeywords = (text) => {
  const normalized = text.toLowerCase()
    .replace(/road\s+(damaged|damage)|damaged\s+road/g, 'road-damage')
    .replace(/potholes?/g, 'road-damage')
    .replace(/garbage|trash|rubbish/g, 'waste');

  return [...new Set(normalized.match(/[a-z]+(?:-[a-z]+)?/g)?.filter((word) => word.length > 2 && !stopWords.has(word)) || [])];
};

const similarity = (first = [], second = []) => {
  const firstTerms = new Set(first);
  const secondTerms = new Set(second);
  const overlap = [...firstTerms].filter((term) => secondTerms.has(term)).length;
  const totalTerms = new Set([...firstTerms, ...secondTerms]).size;
  return totalTerms ? overlap / totalTerms : 0;
};

const distanceInMeters = (first, second) => {
  const earthRadius = 6371000;
  const toRadians = (value) => (value * Math.PI) / 180;
  const deltaLatitude = toRadians(second.latitude - first.latitude);
  const deltaLongitude = toRadians(second.longitude - first.longitude);
  const value = Math.sin(deltaLatitude / 2) ** 2
    + Math.cos(toRadians(first.latitude)) * Math.cos(toRadians(second.latitude)) * Math.sin(deltaLongitude / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
};

const clusterComplaint = async ({ complaint, analysis }) => {
  const keywords = extractKeywords(`${complaint.description} ${analysis.summary} ${analysis.category}`);
  const activeIncidents = await Incident.find({
    status: { $ne: 'resolved' },
    category: analysis.category,
  }).sort({ lastReportedAt: -1 }).limit(50);

  const matchingIncident = activeIncidents.find((incident) => {
    const closeBy = Number.isFinite(complaint.latitude) && Number.isFinite(complaint.longitude)
      && Number.isFinite(incident.latitude) && Number.isFinite(incident.longitude)
      && distanceInMeters(complaint, incident) <= 250;
    const keywordMatch = similarity(keywords, incident.keywords) >= 0.35;
    return closeBy || keywordMatch;
  });

  if (matchingIncident) {
    matchingIncident.reports.push(complaint._id);
    matchingIncident.reportCount += 1;
    matchingIncident.lastReportedAt = new Date();
    await matchingIncident.save();
    return matchingIncident;
  }

  return Incident.create({
    category: analysis.category,
    summary: analysis.summary,
    suggestedDepartment: analysis.suggestedDepartment,
    location: complaint.location,
    latitude: complaint.latitude,
    longitude: complaint.longitude,
    keywords,
    reports: [complaint._id],
  });
};

module.exports = { clusterComplaint };

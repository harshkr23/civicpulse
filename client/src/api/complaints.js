const API_BASE = '/api';

export async function transcribeAudio(audio) {
  const response = await fetch(`${API_BASE}/ai/transcribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audio }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to transcribe recording');
  return data.data.transcript;
}

export async function submitComplaint({ description, location, latitude, longitude, image }) {
  const response = await fetch(`${API_BASE}/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description, location, latitude, longitude, image }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to submit complaint');
  }

  return data.data;
}

export async function getComplaints() {
  const response = await fetch(`${API_BASE}/complaints`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch complaints');
  }

  return data.data;
}

export async function updateComplaint(id, changes) {
  const response = await fetch(`${API_BASE}/complaints/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update complaint');
  return data.data;
}

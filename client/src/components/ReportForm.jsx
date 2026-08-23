import { useEffect, useRef, useState } from 'react';
import { submitComplaint, transcribeAudio } from '../api/complaints';

const severityColors = {
  low: 'text-green-400 bg-green-400/10 border-green-400/20',
  medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  high: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  critical: 'text-red-400 bg-red-400/10 border-red-400/20',
};

export default function ReportForm({ onSubmitted }) {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [locating, setLocating] = useState(false);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [speechSupported] = useState(
    () => typeof window !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia && window.MediaRecorder),
  );
  const fileInputRef = useRef(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingRequestedRef = useRef(false);

  useEffect(() => () => {
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const startRecording = async () => {
    if (!speechSupported || isRecording || isTranscribing) return;

    recordingRequestedRef.current = true;
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!recordingRequestedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
        if (!audioChunksRef.current.length) return;

        setIsTranscribing(true);
        try {
          const audio = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(audio);
          });
          const transcript = await transcribeAudio(dataUrl);
          setDescription((current) => [current, transcript].filter(Boolean).join(current ? ' ' : ''));
        } catch (recordingError) {
          setError(recordingError.message || 'We could not transcribe that recording. Please try again.');
        } finally {
          setIsTranscribing(false);
        }
      };
      recorder.start();
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch (recordingError) {
      setError(recordingError.name === 'NotAllowedError'
        ? 'Microphone access is blocked. Allow it in your browser settings and try again.'
        : 'Recording could not start. Please try again.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    recordingRequestedRef.current = false;
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  };

  const selectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Location services are not available in this browser.');
      return;
    }

    setLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const selectedCoordinates = {
          latitude: Number(coords.latitude.toFixed(6)),
          longitude: Number(coords.longitude.toFixed(6)),
        };
        setCoordinates(selectedCoordinates);
        if (!location) setLocation(`${selectedCoordinates.latitude}, ${selectedCoordinates.longitude}`);
        setLocating(false);
      },
      () => {
        setError('We could not get your location. Please allow location access and try again.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImage({ name: file.name, preview: reader.result });
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const complaint = await submitComplaint({
        description,
        location,
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude,
        image: image?.preview,
      });
      setResult(complaint);
      setDescription('');
      setLocation('');
      setCoordinates(null);
      setImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onSubmitted?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="report-form" className="border-t border-white/5 py-20 sm:py-28">
      <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Report a Civic Issue
          </h2>
          <p className="mt-4 text-slate-400">
            Help your city respond faster. Add a photo, description, and location.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleImageChange}
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Photo</label>
            {image ? (
              <div className="relative overflow-hidden rounded-2xl border border-cyan-400/30 bg-white/5">
                <img src={image.preview} alt="Selected issue" className="h-48 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute right-3 top-3 rounded-full bg-slate-950/80 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-900"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-44 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-cyan-400/50 bg-cyan-400/[0.03] text-slate-300 transition hover:border-cyan-300 hover:bg-cyan-400/[0.07]"
              >
                <span className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-cyan-400/10 text-2xl">📷</span>
                <span className="font-semibold text-white">Upload Image</span>
                <span className="mt-1 text-xs text-slate-500">JPG, PNG, or WEBP</span>
              </button>
            )}
          </div>

          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="description" className="block text-sm font-medium text-slate-200">
                Describe the problem
              </label>
              {speechSupported && (
                <button
                  type="button"
                  onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture?.(event.pointerId);
                    startRecording();
                  }}
                  onPointerUp={stopRecording}
                  onPointerLeave={stopRecording}
                  onPointerCancel={stopRecording}
                  onLostPointerCapture={stopRecording}
                  onKeyDown={(event) => {
                    if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) startRecording();
                  }}
                  onKeyUp={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') stopRecording();
                  }}
                  disabled={isTranscribing}
                  aria-pressed={isRecording}
                  aria-label={isTranscribing ? 'Transcribing recording' : isRecording ? 'Recording — release to stop' : 'Hold to record voice input'}
                  style={{ touchAction: 'none', WebkitTouchCallout: 'none', userSelect: 'none' }}
                  className={`inline-flex select-none items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
                    isRecording
                      ? 'border-red-400/50 bg-red-400/10 text-red-300 shadow-lg shadow-red-500/20'
                      : 'border-white/10 bg-white/5 text-slate-200 hover:border-cyan-400/40 hover:text-white'
                  }`}
                >
                  <span
                    className={isRecording ? 'animate-pulse' : ''}
                    aria-hidden="true"
                    style={{ fontSize: '1rem' }}
                  >🎤</span>
                  {isTranscribing ? 'Transcribing…' : isRecording ? 'Recording… release to stop' : 'Hold / Record'}
                </button>
              )}
            </div>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What needs attention? Include helpful details like the size, impact, or nearby landmarks."
            rows={4}
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
          />
          {speechSupported && (
            <p className="mt-2 text-xs text-slate-500">Hold the microphone button and describe the issue — Gemini will add the transcript for you.</p>
          )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label htmlFor="location" className="block text-sm font-medium text-slate-200">
                <span aria-hidden="true">📍 </span>Location
              </label>
              <button
                type="button"
                onClick={selectCurrentLocation}
                disabled={locating}
                className="text-xs font-semibold text-cyan-300 transition hover:text-cyan-200 disabled:cursor-wait disabled:opacity-60"
              >
                {locating ? 'Finding location…' : 'Use current location'}
              </button>
            </div>
            <input
              id="location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Street address, landmark, or neighborhood"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
            />
            {coordinates && (
              <p className="mt-2 text-xs text-cyan-300">
                Location selected · {coordinates.latitude}, {coordinates.longitude}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !description.trim()}
            className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Analyzing with Gemini…' : 'Analyze with Gemini ✨'}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-cyan-400/20 bg-gradient-to-b from-cyan-400/[0.08] to-white/[0.03]">
            <div className="border-b border-white/10 px-6 py-4">
              <p className="text-xs font-bold tracking-[0.16em] text-cyan-300">✨ AI ANALYSIS</p>
            </div>

            <div className="px-6 py-5">
              <p className="text-2xl font-bold tracking-tight text-white">{result.category}</p>
              <span
                className={`mt-3 inline-block rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${severityColors[result.severity] || severityColors.medium}`}
              >
                {result.severity === 'high' ? '🔴 HIGH PRIORITY' : `${result.severity} priority`}
              </span>

              <p className="mt-5 text-base leading-7 text-slate-200">{result.summary}</p>

              {result.incident?.reportCount > 1 && (
                <p className="mt-4 rounded-xl border border-violet-400/20 bg-violet-400/10 px-4 py-3 text-sm text-violet-100">
                  ✨ Likely same incident · {result.incident.reportCount} reports are now grouped together.
                </p>
              )}

              <div className="mt-5 border-t border-white/10 pt-5">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Suggested Department</p>
                <p className="mt-1 text-sm font-semibold text-cyan-300">{result.suggestedDepartment}</p>
              </div>

              {result.location && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(result.location)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
                >
                  <span className="mr-2" aria-hidden="true">🗺️</span> View on Map
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

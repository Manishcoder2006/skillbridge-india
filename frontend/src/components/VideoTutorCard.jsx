import React, { useState, useEffect } from 'react';
import { createVideoTutorJob, getVideoTutorJob } from '../services/api';
import '../styles/video-tutor.css';

const VideoTutorCard = () => {
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(300);
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);

  const submitJob = async () => {
    setError(null);
    try {
      const response = await createVideoTutorJob({ topic, max_duration_seconds: duration });
      setJobId(response.job_id);
      setStatus(response.status);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create job');
    }
  };

  // Poll for job status when jobId is set
  useEffect(() => {
    if (!jobId) return;
    const interval = setInterval(async () => {
      try {
        const res = await getVideoTutorJob(jobId);
        setStatus(res.status);
        if (res.status === 'completed' && res.video_url) {
          setVideoUrl(res.video_url);
          clearInterval(interval);
        }
        if (res.status === 'failed') {
          setError('Video generation failed');
          clearInterval(interval);
        }
      } catch (e) {
        setError('Error fetching job status');
        clearInterval(interval);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [jobId]);

  return (
    <div className="video-tutor-card glassmorphism">
      <h2 className="title">AI Video Tutor</h2>
      <div className="form-group">
        <label>Topic</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter learning topic"
        />
      </div>
      <div className="form-group">
        <label>Max Duration (seconds)</label>
        <input
          type="number"
          min="30"
          max="600"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value, 10))}
        />
      </div>
      <button className="primary-btn" onClick={submitJob} disabled={!topic}>
        Generate Video
      </button>

      {error && <div className="error-alert">{error}</div>}

      {status && <p className="status">Status: {status}</p>}

      {videoUrl && (
        <div className="video-wrapper">
          <video controls src={videoUrl} width="100%" />
        </div>
      )}
    </div>
  );
};

export default VideoTutorCard;

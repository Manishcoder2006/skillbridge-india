import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Volume2,
  VolumeX,
  RotateCcw,
  LogOut,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Cpu,
  ShieldCheck,
  Radio,
  User,
  Check
} from 'lucide-react';
import { useVoiceInterview } from './useVoiceInterview';
import { Badge } from '../../../components/common/Badge';

export const VoiceVideoInterviewScreen = ({
  session,
  onSubmitAnswer,
  onCompleteInterview,
  onExit,
  isEvaluating,
  isCompleting,
}) => {
  const questions = session?.questions || [];
  const [currentIndex, setCurrentIndex] = useState(session?.current_question_index || 0);
  const [showHint, setShowHint] = useState(false);
  const [interviewTimer, setInterviewTimer] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [autoProgressState, setAutoProgressState] = useState('idle'); // 'idle' | 'ai_speaking' | 'listening' | 'evaluating' | 'transitioning'
  const [lastEvaluatedScore, setLastEvaluatedScore] = useState(null);

  const videoRef = useRef(null);
  const currentQuestion = questions[currentIndex] || questions[0];

  // Callback when candidate finishes speaking
  const handleAnswerSpoken = async (spokenText) => {
    if (!spokenText || !spokenText.trim() || !currentQuestion) return;
    setAutoProgressState('evaluating');

    try {
      const evalResult = await onSubmitAnswer(currentQuestion.id, spokenText.trim());
      if (evalResult?.score !== undefined) {
        setLastEvaluatedScore(evalResult.score);
      }

      // Check if this was the last question
      if (currentIndex >= questions.length - 1 || evalResult?.is_final_question) {
        setAutoProgressState('transitioning');
        setTimeout(() => {
          onCompleteInterview();
        }, 1200);
      } else {
        // Move to next question automatically
        setAutoProgressState('transitioning');
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
          setLastEvaluatedScore(null);
          setAutoProgressState('idle');
        }, 1500);
      }
    } catch (err) {
      console.error('Error submitting verbal answer:', err);
      setAutoProgressState('idle');
    }
  };

  const {
    stream,
    isCameraOn,
    isMicMuted,
    mediaPermissionState,
    mediaError,
    audioVolume,
    startCamera,
    toggleCamera,
    toggleMicrophone,
    stopAllMediaTracks,
    isAISpeaking,
    ttsSupported,
    speakText,
    stopSpeaking,
    isListening,
    transcript,
    interimTranscript,
    currentSpokenText,
    sttSupported,
    sttError,
    startListening,
    stopListening,
  } = useVoiceInterview({
    onAnswerSpoken: handleAnswerSpoken,
    targetLang: 'en-IN',
  });

  // Start Camera & Microphone on component mount
  useEffect(() => {
    startCamera();
    return () => {
      stopAllMediaTracks();
    };
  }, [startCamera, stopAllMediaTracks]);

  // Bind media stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isCameraOn]);

  // Interview Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setInterviewTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Elapsed Time (MM:SS)
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Whenever currentIndex updates or new question loads, AI speaks the question!
  useEffect(() => {
    if (!currentQuestion) return;

    // Small delay to allow audio context and render
    const speechTimeout = setTimeout(() => {
      setAutoProgressState('ai_speaking');
      const introPrefix =
        currentIndex === 0
          ? `Welcome to your ${session?.role || 'Technical'} AI interview. Let's begin with question 1. `
          : `Question ${currentIndex + 1}. `;

      const fullQuestionToSpeak = `${introPrefix}${currentQuestion.question_text}`;

      speakText(fullQuestionToSpeak, () => {
        // When AI finishes speaking, automatically start listening for candidate's voice
        setAutoProgressState('listening');
        startListening();
      });
    }, 600);

    return () => {
      clearTimeout(speechTimeout);
      stopSpeaking();
    };
  }, [currentIndex, currentQuestion, session?.role, speakText, startListening, stopSpeaking]);

  // Replay question audio
  const handleReplayQuestion = () => {
    if (!currentQuestion) return;
    stopListening();
    setAutoProgressState('ai_speaking');
    speakText(currentQuestion.question_text, () => {
      setAutoProgressState('listening');
      startListening();
    });
  };

  // Manual Done Speaking trigger
  const handleDoneSpeaking = () => {
    if (isListening) {
      stopListening();
    }
  };

  const progressPercent = Math.round(((currentIndex + 1) / Math.max(questions.length, 1)) * 100);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* =======================================================================
          1. TOP BAR: Google Meet / Zoom Style Interview Header
         ======================================================================= */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
          borderRadius: '16px',
          padding: '1rem 1.5rem',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 8px 24px -6px rgba(15, 23, 42, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Left Info: Mode & Target Role */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.75rem',
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '999px',
              color: '#38bdf8',
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            <Radio size={13} className="pulse-animation" /> Live AI Interview
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#ffffff', lineHeight: 1.2 }}>
              {session?.role || 'Full Stack Developer'}
            </h2>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              Mode: <span style={{ color: '#e2e8f0', textTransform: 'capitalize' }}>{session?.interview_type || 'Technical'}</span> • Level: {session?.experience_level || 'Intermediate'}
            </div>
          </div>
        </div>

        {/* Right Info: Progress, Timer & End Call */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          {/* Question Counter */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Question Progress
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
              {currentIndex + 1} <span style={{ color: '#64748b', fontSize: '0.85rem' }}>of {questions.length}</span>
            </div>
          </div>

          {/* Timer Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '0.45rem 0.85rem',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#cbd5e1',
            }}
          >
            <Clock size={15} color="#38bdf8" /> {formatTime(interviewTimer)}
          </div>

          {/* End Interview Action */}
          <button
            type="button"
            onClick={() => setShowExitConfirm(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '0.45rem 0.9rem',
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Leave interview session"
          >
            <LogOut size={15} /> Exit
          </button>
        </div>
      </div>

      {/* Linear Question Progress Bar */}
      <div
        style={{
          width: '100%',
          background: '#1e293b',
          borderRadius: '999px',
          height: '6px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progressPercent}%`,
            background: 'linear-gradient(90deg, #38bdf8 0%, #818cf8 50%, #a855f7 100%)',
            height: '100%',
            borderRadius: '999px',
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>

      {/* =======================================================================
          2. MAIN STAGE: Side-by-Side Interview Area (Google Meet / Zoom Style)
         ======================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1fr)',
          gap: '1.25rem',
          alignItems: 'stretch',
        }}
        className="interview-grid-layout"
      >
        {/* LEFT / LARGE PANEL: AI Interviewer */}
        <div
          style={{
            background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
            borderRadius: '20px',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 12px 30px -8px rgba(0, 0, 0, 0.35)',
            minHeight: '440px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top Header of AI Panel */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f8fafc' }}>
                  SkillBridge AI Interviewer
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Adaptive Multi-Model Intelligence (Gemini + Groq)
                </div>
              </div>
            </div>

            {/* AI Speaking Indicator Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.35rem 0.8rem',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 800,
                background: isAISpeaking ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                color: isAISpeaking ? '#38bdf8' : '#94a3b8',
                border: isAISpeaking ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.2s ease',
              }}
            >
              <Volume2 size={14} className={isAISpeaking ? 'pulse-animation' : ''} />
              {isAISpeaking ? 'AI Speaking...' : isListening ? 'AI Listening...' : isEvaluating ? 'Evaluating...' : 'Ready'}
            </div>
          </div>

          {/* Center Stage: AI Avatar Visualizer & Current Question */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '1rem 0.5rem',
              zIndex: 2,
              gap: '1.25rem',
            }}
          >
            {/* AI Avatar Orb with Speaking Waves */}
            <div
              style={{
                position: 'relative',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #4f46e5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: isAISpeaking ? '3px solid #38bdf8' : '2px solid rgba(255, 255, 255, 0.15)',
                boxShadow: isAISpeaking
                  ? '0 0 35px rgba(56, 189, 248, 0.6), inset 0 0 20px rgba(99, 102, 241, 0.5)'
                  : '0 10px 25px rgba(0, 0, 0, 0.4)',
                transition: 'all 0.3s ease',
              }}
            >
              <Cpu size={42} color={isAISpeaking ? '#38bdf8' : '#c7d2fe'} />

              {/* Animated Speaking Waves */}
              {isAISpeaking && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    left: '-8px',
                    right: '-8px',
                    bottom: '-8px',
                    borderRadius: '50%',
                    border: '2px solid rgba(56, 189, 248, 0.5)',
                    animation: 'ripple 1.5s cubic-bezier(0, 0.2, 0.8, 1) infinite',
                  }}
                />
              )}
            </div>

            {/* Audio Wave Spectrum Visualizer when AI speaks */}
            {isAISpeaking && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '24px' }}>
                {[18, 28, 14, 32, 22, 36, 16, 26, 34, 18, 30].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      width: '4px',
                      height: `${h}px`,
                      background: 'linear-gradient(180deg, #38bdf8, #818cf8)',
                      borderRadius: '2px',
                      animation: `soundWave 0.8s ease-in-out infinite alternate ${i * 0.08}s`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Question Text Area */}
            {currentQuestion ? (
              <div style={{ maxWidth: '640px', width: '100%' }}>
                {/* Category & Difficulty Badges */}
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.65rem',
                      borderRadius: '6px',
                      background: 'rgba(99, 102, 241, 0.2)',
                      color: '#a5b4fc',
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {currentQuestion.category || 'Core Architecture'}
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.65rem',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#cbd5e1',
                      textTransform: 'capitalize',
                    }}
                  >
                    Level: {currentQuestion.difficulty || 'Intermediate'}
                  </span>
                </div>

                {/* Spoken Question Text */}
                <div
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#f8fafc',
                    lineHeight: '1.55',
                    letterSpacing: '-0.01em',
                  }}
                >
                  "{currentQuestion.question_text}"
                </div>

                {/* Thinking Hint Framework Toggle */}
                {currentQuestion.hint && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => setShowHint(!showHint)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#fbbf24',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <Lightbulb size={14} />
                      {showHint ? 'Hide Framework' : '💡 Need a Thought Framework?'}
                      {showHint ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {showHint && (
                      <div
                        style={{
                          marginTop: '0.5rem',
                          padding: '0.75rem 1rem',
                          background: 'rgba(251, 191, 36, 0.08)',
                          border: '1px solid rgba(251, 191, 36, 0.25)',
                          borderRadius: '10px',
                          color: '#fef3c7',
                          fontSize: '0.82rem',
                          lineHeight: '1.5',
                          textAlign: 'left',
                        }}
                      >
                        <strong>Recommended Approach:</strong> {currentQuestion.hint}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Bottom Controls of AI Panel */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              zIndex: 2,
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              {isAISpeaking ? (
                <span>🔊 Listen to the AI interviewer...</span>
              ) : isListening ? (
                <span style={{ color: '#4ade80', fontWeight: 600 }}>🎙️ Speak your answer clearly into your microphone</span>
              ) : isEvaluating ? (
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>⚙️ AI is evaluating your verbal answer...</span>
              ) : (
                <span>Ready for next question</span>
              )}
            </div>

            {/* Replay Question Button */}
            <button
              type="button"
              onClick={handleReplayQuestion}
              disabled={isEvaluating || isCompleting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#f8fafc',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Hear the interviewer repeat the question"
            >
              <RotateCcw size={13} /> Replay Question
            </button>
          </div>
        </div>

        {/* RIGHT / SMALL PANEL: Candidate Camera Self-View */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {/* Candidate Webcam Container */}
          <div
            style={{
              position: 'relative',
              background: '#020617',
              borderRadius: '20px',
              overflow: 'hidden',
              aspectRatio: '4 / 3',
              border:
                audioVolume > 15 && isListening
                  ? '3px solid #22c55e'
                  : '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow:
                audioVolume > 15 && isListening
                  ? '0 0 24px rgba(34, 197, 94, 0.4)'
                  : '0 8px 24px rgba(0, 0, 0, 0.4)',
              transition: 'border 0.2s ease, box-shadow 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Live Video Feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)', // Mirror candidate video naturally
                display: isCameraOn && mediaPermissionState === 'granted' ? 'block' : 'none',
              }}
            />

            {/* Camera OFF or Permission Denied Placeholder */}
            {(!isCameraOn || mediaPermissionState !== 'granted') && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  padding: '1.5rem',
                  textAlign: 'center',
                  color: '#94a3b8',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                  }}
                >
                  <User size={32} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0' }}>
                    {mediaPermissionState === 'denied'
                      ? 'Camera Permission Denied'
                      : mediaPermissionState === 'requesting'
                      ? 'Requesting Camera...'
                      : 'Camera is Switched Off'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                    {mediaPermissionState === 'denied'
                      ? 'Enable camera in browser permissions'
                      : 'Click camera icon below to turn on'}
                  </div>
                </div>
              </div>
            )}

            {/* Top Overlay Badge: Candidate Self */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(8px)',
                padding: '0.25rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <div
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: isCameraOn ? '#22c55e' : '#ef4444',
                }}
              />
              Candidate (You)
            </div>

            {/* Bottom Overlay Controls on Camera */}
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '0',
                right: '0',
                display: 'flex',
                justifyContent: 'center',
                gap: '0.75rem',
              }}
            >
              {/* Mic Toggle Button */}
              <button
                type="button"
                onClick={toggleMicrophone}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: isMicMuted ? 'rgba(239, 68, 68, 0.9)' : 'rgba(15, 23, 42, 0.8)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMicMuted ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              {/* Camera Toggle Button */}
              <button
                type="button"
                onClick={toggleCamera}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: !isCameraOn ? 'rgba(239, 68, 68, 0.9)' : 'rgba(15, 23, 42, 0.8)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
              >
                {!isCameraOn ? <VideoOff size={16} /> : <VideoIcon size={16} />}
              </button>
            </div>
          </div>

          {/* Quick Audio Activity Meter */}
          <div
            style={{
              padding: '0.85rem 1rem',
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Microphone Audio Input
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: isMicMuted ? '#ef4444' : audioVolume > 10 ? '#16a34a' : '#64748b',
                }}
              >
                {isMicMuted ? 'Muted' : audioVolume > 10 ? 'Speaking...' : 'Listening...'}
              </span>
            </div>

            {/* Volume Level Bar */}
            <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  width: isMicMuted ? '0%' : `${audioVolume}%`,
                  height: '100%',
                  background: audioVolume > 50 ? '#16a34a' : '#3b82f6',
                  borderRadius: '999px',
                  transition: 'width 0.1s ease',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* =======================================================================
          3. BOTTOM LIVE TRANSCRIPT & INTERACTIVE CONTROLS BAR
         ======================================================================= */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {/* Status Indicator & Live Transcript Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: isListening ? '#22c55e' : isAISpeaking ? '#38bdf8' : isEvaluating ? '#eab308' : '#94a3b8',
                display: 'inline-block',
              }}
              className={isListening || isAISpeaking ? 'pulse-animation' : ''}
            />
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {isAISpeaking
                ? 'AI is speaking the question...'
                : isListening
                ? 'Listening to your verbal answer...'
                : isEvaluating
                ? 'Evaluating your verbal answer with AI...'
                : 'Ready'}
            </span>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Speak naturally. Auto-detects silence, or click <strong>Done Speaking</strong>.
          </div>
        </div>

        {/* Live Spoken Answer Transcript Box */}
        <div
          style={{
            padding: '1rem 1.25rem',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            minHeight: '72px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#64748b',
              marginBottom: '0.35rem',
              letterSpacing: '0.04em',
            }}
          >
            Your Spoken Answer (Live Transcript):
          </div>

          {currentSpokenText ? (
            <div
              style={{
                fontSize: '0.95rem',
                color: '#1e293b',
                lineHeight: '1.5',
                fontWeight: 500,
              }}
            >
              <span>{transcript}</span>
              <span style={{ color: '#6366f1', fontStyle: 'italic', marginLeft: transcript ? '4px' : '0' }}>
                {interimTranscript}
              </span>
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
              {isAISpeaking
                ? 'Interviewer is speaking... Get ready to respond verbally.'
                : isListening
                ? 'Listening... Start speaking into your microphone now.'
                : isEvaluating
                ? 'Processing your verbal answer...'
                : 'Waiting for speech...'}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* Quick Status / Score Badge if just evaluated */}
          <div>
            {lastEvaluatedScore !== null && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#15803d',
                  background: '#dcfce7',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '6px',
                }}
              >
                <Check size={14} /> Answer Recorded • Score: {lastEvaluatedScore}/10
              </span>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {/* Done Speaking Button */}
            <button
              type="button"
              onClick={handleDoneSpeaking}
              disabled={!isListening || (!transcript && !interimTranscript)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                background:
                  isListening && (transcript || interimTranscript)
                    ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                    : '#e2e8f0',
                color: isListening && (transcript || interimTranscript) ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor:
                  isListening && (transcript || interimTranscript) ? 'pointer' : 'not-allowed',
                boxShadow:
                  isListening && (transcript || interimTranscript)
                    ? '0 4px 14px rgba(34, 197, 94, 0.35)'
                    : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <CheckCircle2 size={16} />
              Done Speaking
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal to Exit Interview */}
      {showExitConfirm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '1.75rem',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: '#fee2e2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LogOut size={20} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Exit AI Interview?
              </h3>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Are you sure you want to end this interview? Your webcam and microphone will be released immediately.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: '8px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  stopAllMediaTracks();
                  stopSpeaking();
                  onExit();
                }}
                style={{
                  padding: '0.6rem 1.2rem',
                  borderRadius: '8px',
                  background: '#dc2626',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Exit Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

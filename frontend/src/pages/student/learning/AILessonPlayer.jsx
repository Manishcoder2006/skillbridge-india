import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  Code2,
  Layers,
  Send,
  Lightbulb,
  Check,
  Cpu,
  Clock,
  BookOpen
} from 'lucide-react';
import { useAILearningTutor } from './useAILearningTutor';
import { apiService } from '../../../services/api';
import { Badge } from '../../../components/common/Badge';

export const AILessonPlayer = ({
  path,
  initialLessonIndex = 0,
  onExit,
  onProgressUpdated,
}) => {
  const lessons = path?.lessons || [];
  const [currentLessonIndex, setCurrentLessonIndex] = useState(initialLessonIndex);
  const [showAskDrawer, setShowAskDrawer] = useState(false);
  const [askQuestion, setAskQuestion] = useState('');
  const [askAnswer, setAskAnswer] = useState(null);
  const [isAsking, setIsAsking] = useState(false);
  const [elapsedTimer, setElapsedTimer] = useState(0);

  const currentLesson = lessons[currentLessonIndex] || lessons[0];

  const {
    isSpeaking,
    isPaused,
    speechSupported,
    activeSentenceIndex,
    sentences,
    speakLesson,
    pauseSpeech,
    resumeSpeech,
    stopSpeech,
  } = useAILearningTutor({ targetLang: 'en-IN' });

  // Lesson elapsed timer
  useEffect(() => {
    setElapsedTimer(0);
    const interval = setInterval(() => {
      setElapsedTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentLessonIndex]);

  // Format MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Automatically narrate lesson when lesson loads
  useEffect(() => {
    if (!currentLesson?.script) return;
    const timeout = setTimeout(() => {
      speakLesson(currentLesson.script, () => {
        // Mark lesson completed when narration finishes
        handleMarkLessonComplete(true);
      });
    }, 400);

    return () => {
      clearTimeout(timeout);
      stopSpeech();
    };
  }, [currentLessonIndex, currentLesson?.script]);

  const handleMarkLessonComplete = async (completed = true) => {
    if (!path?.id || !currentLesson) return;
    try {
      await apiService.updateLessonProgress(path.id, currentLesson.lesson_number, completed);
      currentLesson.is_completed = completed;
      if (onProgressUpdated) {
        onProgressUpdated(path.id, currentLesson.lesson_number, completed);
      }
    } catch (err) {
      console.warn('Could not persist lesson progress:', err);
    }
  };

  const handleTogglePlayPause = () => {
    if (isSpeaking && !isPaused) {
      pauseSpeech();
    } else if (isPaused) {
      resumeSpeech();
    } else {
      speakLesson(currentLesson.script, () => {
        handleMarkLessonComplete(true);
      });
    }
  };

  const handleReplay = () => {
    setElapsedTimer(0);
    speakLesson(currentLesson.script, () => {
      handleMarkLessonComplete(true);
    });
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < lessons.length - 1) {
      stopSpeech();
      setShowAskDrawer(false);
      setAskAnswer(null);
      setCurrentLessonIndex((prev) => prev + 1);
    }
  };

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      stopSpeech();
      setShowAskDrawer(false);
      setAskAnswer(null);
      setCurrentLessonIndex((prev) => prev - 1);
    }
  };

  const handleAskTutorSubmit = async (e) => {
    e.preventDefault();
    if (!askQuestion.trim() || isAsking) return;

    try {
      setIsAsking(true);
      const res = await apiService.askAITutor({
        path_id: path.id,
        lesson_number: currentLesson.lesson_number,
        lesson_title: currentLesson.title,
        question: askQuestion.trim(),
        context_script: currentLesson.script,
      });
      setAskAnswer(res);
    } catch (err) {
      setAskAnswer({
        answer: 'In modern architectures, focus on simplicity and scalability tradeoffs.',
        key_takeaway: 'Balance clean design with practical delivery.',
      });
    } finally {
      setIsAsking(false);
    }
  };

  // Progress percentage across path
  const completedCount = lessons.filter((l) => l.is_completed).length;
  const pathProgressPercent = Math.round(((currentLessonIndex + 1) / Math.max(lessons.length, 1)) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1180px', margin: '0 auto', width: '100%' }}>
      {/* 1. TOP HEADER & LESSON PROGRESS BAR */}
      <div
        style={{
          background: 'linear-gradient(135deg, #042f2e 0%, #0f766e 50%, #115e59 100%)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 8px 24px -6px rgba(15, 118, 110, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="button"
            onClick={onExit}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.8rem',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={14} /> Back to Paths
          </button>

          <div>
            <div style={{ fontSize: '0.78rem', color: '#ccfbf1', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}>
              AI MICRO-LEARNING • {path?.topic}
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0.15rem 0 0', color: '#ffffff' }}>
              Lesson {currentLessonIndex + 1} of {lessons.length}: {currentLesson?.title}
            </h2>
          </div>
        </div>

        {/* Right Info: Lesson Timer & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '0.4rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#ccfbf1',
            }}
          >
            <Clock size={14} color="#fde047" /> {formatTime(elapsedTimer)} / ~{currentLesson?.duration_seconds || 60}s
          </div>

          <button
            type="button"
            onClick={() => setShowAskDrawer(!showAskDrawer)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.9rem',
              background: showAskDrawer ? '#fde047' : 'rgba(255, 255, 255, 0.15)',
              color: showAskDrawer ? '#042f2e' : '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <MessageSquare size={14} /> Ask AI Tutor
          </button>
        </div>
      </div>

      {/* Path Linear Progress Bar */}
      <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
        <div
          style={{
            width: `${pathProgressPercent}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #0d9488 0%, #14b8a6 50%, #38bdf8 100%)',
            borderRadius: '999px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* 2. MAIN STAGE: SHORT EDUCATIONAL VIDEO EXPERIENCE */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.7fr) minmax(320px, 1fr)',
          gap: '1.25rem',
          alignItems: 'start',
        }}
        className="learning-grid-layout"
      >
        {/* LEFT / MAIN PANEL: Educational Video Screen */}
        <div
          style={{
            background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
            borderRadius: '20px',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            color: '#ffffff',
            boxShadow: '0 12px 30px -8px rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            position: 'relative',
          }}
        >
          {/* Top Video HUD: AI Tutor Avatar & Speaking Status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Avatar Orb */}
              <div
                style={{
                  position: 'relative',
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: isSpeaking ? '2.5px solid #38bdf8' : '2px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: isSpeaking
                    ? '0 0 24px rgba(56, 189, 248, 0.6)'
                    : '0 4px 12px rgba(0, 0, 0, 0.3)',
                }}
              >
                <Cpu size={26} color="#ffffff" />
                {isSpeaking && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      left: '-6px',
                      right: '-6px',
                      bottom: '-6px',
                      borderRadius: '50%',
                      border: '2px solid rgba(56, 189, 248, 0.5)',
                      animation: 'ripple 1.5s cubic-bezier(0, 0.2, 0.8, 1) infinite',
                    }}
                  />
                )}
              </div>

              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f8fafc' }}>
                  AI Micro-Tutor
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Explaining ~{currentLesson?.duration_seconds || 60}s concept
                </div>
              </div>
            </div>

            {/* Speaking Status Badge & Audio Spectrum */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {isSpeaking && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '18px' }}>
                  {[12, 22, 10, 26, 16, 28, 14, 20].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        width: '3.5px',
                        height: `${h}px`,
                        background: 'linear-gradient(180deg, #38bdf8, #14b8a6)',
                        borderRadius: '2px',
                        animation: `soundWave 0.75s ease-in-out infinite alternate ${i * 0.08}s`,
                      }}
                    />
                  ))}
                </div>
              )}

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  background: isSpeaking ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  color: isSpeaking ? '#38bdf8' : '#94a3b8',
                  border: isSpeaking ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Volume2 size={13} className={isSpeaking ? 'pulse-animation' : ''} />
                {isSpeaking ? 'AI Explaining...' : isPaused ? 'Paused' : 'Ready'}
              </div>
            </div>
          </div>

          {/* Synchronized Spoken Explanation Card */}
          <div
            style={{
              padding: '1.25rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '14px',
              lineHeight: '1.65',
              fontSize: '1rem',
              color: '#e2e8f0',
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
              Live Spoken Explanation:
            </div>

            <div>
              {sentences && sentences.length > 0 ? (
                sentences.map((sent, idx) => (
                  <span
                    key={idx}
                    style={{
                      background:
                        isSpeaking && idx === activeSentenceIndex
                          ? 'rgba(56, 189, 248, 0.28)'
                          : 'transparent',
                      color:
                        isSpeaking && idx === activeSentenceIndex
                          ? '#ffffff'
                          : idx < activeSentenceIndex
                          ? '#cbd5e1'
                          : '#94a3b8',
                      padding: '0.1rem 0.25rem',
                      borderRadius: '4px',
                      transition: 'background 0.25s ease, color 0.25s ease',
                      fontWeight: isSpeaking && idx === activeSentenceIndex ? 700 : 400,
                    }}
                  >
                    {sent}{' '}
                  </span>
                ))
              ) : (
                <span>{currentLesson?.script}</span>
              )}
            </div>
          </div>

          {/* Visual Concept Diagram (ASCII / Architecture layout) */}
          {currentLesson?.visual_diagram && (
            <div
              style={{
                padding: '1rem 1.25rem',
                background: '#020617',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                fontFamily: 'monospace',
                fontSize: '0.82rem',
                color: '#38bdf8',
                whiteSpace: 'pre-wrap',
                overflowX: 'auto',
                lineHeight: '1.45',
              }}
            >
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.35rem', fontFamily: 'sans-serif' }}>
                Concept Diagram:
              </div>
              {currentLesson.visual_diagram}
            </div>
          )}

          {/* Code Snippet Container */}
          {currentLesson?.code_snippet && (
            <div
              style={{
                borderRadius: '12px',
                background: '#0b0f19',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.45rem 0.85rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Code2 size={13} color="#38bdf8" /> Code Example
                </div>
                <span>{currentLesson.code_language || 'Code'}</span>
              </div>
              <pre
                style={{
                  padding: '1rem',
                  margin: 0,
                  fontSize: '0.85rem',
                  color: '#e0e7ff',
                  fontFamily: 'monospace',
                  overflowX: 'auto',
                  lineHeight: '1.5',
                }}
              >
                <code>{currentLesson.code_snippet}</code>
              </pre>
            </div>
          )}

          {/* Real-World Analogy / Example */}
          {currentLesson?.example && (
            <div
              style={{
                padding: '0.75rem 1rem',
                background: 'rgba(251, 191, 36, 0.08)',
                border: '1px solid rgba(251, 191, 36, 0.25)',
                borderRadius: '10px',
                color: '#fef3c7',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
              }}
            >
              <Lightbulb size={16} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Mental Model / Analogy:</strong> {currentLesson.example}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Live Lesson Notes & Path Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Notes Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '1.25rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#0d9488', letterSpacing: '0.04em' }}>
                Lesson Objective
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', margin: '0.25rem 0 0', fontWeight: 600, lineHeight: '1.4' }}>
                {currentLesson?.objective}
              </p>
            </div>

            {/* Key Takeaways */}
            {currentLesson?.key_points && currentLesson.key_points.length > 0 && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Core Takeaways:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {currentLesson.key_points.map((pt, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', fontSize: '0.82rem', color: '#334155', lineHeight: '1.4' }}>
                      <CheckCircle2 size={14} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Full Path Table of Contents */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '1.25rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Course Syllabus ({completedCount}/{lessons.length} Completed)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '280px', overflowY: 'auto' }}>
              {lessons.map((l, idx) => {
                const isSelected = idx === currentLessonIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      stopSpeech();
                      setCurrentLessonIndex(idx);
                      setShowAskDrawer(false);
                      setAskAnswer(null);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: isSelected ? '#ccfbf1' : '#f8fafc',
                      color: isSelected ? '#0f766e' : 'var(--text-primary)',
                      fontWeight: isSelected ? 800 : 500,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: isSelected ? '#0d9488' : '#94a3b8' }}>
                        {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}.
                      </span>
                      <span>{l.title}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {l.is_completed ? (
                        <Check size={14} color="#16a34a" />
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>~{l.duration_seconds}s</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. CONTEXTUAL "ASK AI TUTOR" DRAWER */}
      {showAskDrawer && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            border: '1.5px solid #0d9488',
            boxShadow: '0 8px 24px rgba(13, 148, 136, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} color="#0d9488" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Ask AI Tutor about "{currentLesson?.title}"
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowAskDrawer(false)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Close
            </button>
          </div>

          <form onSubmit={handleAskTutorSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={askQuestion}
              onChange={(e) => setAskQuestion(e.target.value)}
              placeholder="e.g. What is the difference between Flexbox and Grid? Or why is this used?"
              style={{
                flex: 1,
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={isAsking || !askQuestion.trim()}
              style={{
                padding: '0.65rem 1.25rem',
                background: '#0d9488',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: isAsking || !askQuestion.trim() ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              {isAsking ? 'Thinking...' : <><Send size={13} /> Ask</>}
            </button>
          </form>

          {askAnswer && (
            <div
              style={{
                padding: '1rem',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '10px',
                color: '#166534',
                fontSize: '0.85rem',
                lineHeight: '1.5',
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: '0.25rem' }}>
                AI Tutor Answer:
              </div>
              <p style={{ margin: 0 }}>{askAnswer.answer}</p>
              {askAnswer.key_takeaway && (
                <div style={{ marginTop: '0.5rem', fontWeight: 700, color: '#15803d' }}>
                  Key Takeaway: {askAnswer.key_takeaway}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. BOTTOM VIDEO PLAYER CONTROLS */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '1rem 1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Left: Previous Lesson */}
        <button
          type="button"
          onClick={handlePreviousLesson}
          disabled={currentLessonIndex === 0}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.55rem 1rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            background: currentLessonIndex === 0 ? '#f8fafc' : '#ffffff',
            color: currentLessonIndex === 0 ? '#94a3b8' : 'var(--text-primary)',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: currentLessonIndex === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          <ChevronLeft size={16} /> Previous Lesson
        </button>

        {/* Center: Play/Pause/Replay Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handleReplay}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            title="Replay lesson from start"
          >
            <RotateCcw size={14} /> Replay
          </button>

          {/* Primary Play / Pause Button */}
          <button
            type="button"
            onClick={handleTogglePlayPause}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.65rem 1.5rem',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)',
            }}
          >
            {isSpeaking && !isPaused ? (
              <>
                <Pause size={16} fill="#ffffff" /> Pause Explanation
              </>
            ) : (
              <>
                <Play size={16} fill="#ffffff" /> {isPaused ? 'Resume' : 'Play Explanation'}
              </>
            )}
          </button>
        </div>

        {/* Right: Next Lesson or Complete */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {currentLessonIndex < lessons.length - 1 ? (
            <button
              type="button"
              onClick={handleNextLesson}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.55rem 1.25rem',
                borderRadius: '8px',
                background: '#0d9488',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Next Lesson <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                handleMarkLessonComplete(true);
                onExit();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.55rem 1.25rem',
                borderRadius: '8px',
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <CheckCircle2 size={16} /> Path Completed!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

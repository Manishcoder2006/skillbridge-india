import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  LogOut,
  HelpCircle,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';

export const InterviewScreen = ({
  session,
  onSubmitAnswer,
  onCompleteInterview,
  onExit,
  isEvaluating,
  isCompleting,
}) => {
  const questions = session?.questions || [];
  const [currentIndex, setCurrentIndex] = useState(session?.current_question_index || 0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [evaluations, setEvaluations] = useState({}); // { [question_id]: evaluation_data }
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const recognitionRef = useRef(null);
  const currentQuestion = questions[currentIndex] || questions[0];
  const currentEval = currentQuestion ? evaluations[currentQuestion.id] : null;

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentAnswer((prev) => prev + (prev.length > 0 && !prev.endsWith(' ') ? ' ' : '') + transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleSpeech = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!currentAnswer.trim() || !currentQuestion) return;
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const evalResult = await onSubmitAnswer(currentQuestion.id, currentAnswer.trim());
    if (evalResult) {
      setEvaluations((prev) => ({
        ...prev,
        [currentQuestion.id]: evalResult,
      }));
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setCurrentAnswer('');
      setShowHint(false);
    } else {
      onCompleteInterview();
    }
  };

  const progressPercent = Math.round(((currentIndex + (currentEval ? 1 : 0)) / Math.max(questions.length, 1)) * 100);
  const wordCount = currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '880px', margin: '0 auto' }}>
      {/* Top Header / Progress HUD */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          boxShadow: '0 4px 16px rgba(49, 46, 129, 0.25)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                padding: '0.25rem 0.65rem',
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '6px',
                color: '#a5f3fc',
              }}
            >
              {session?.interview_type || 'TECHNICAL'} MODE
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{session?.role || 'Software Engineer'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#c7d2fe', fontWeight: 600 }}>
              Question <strong style={{ color: '#ffffff' }}>{currentIndex + 1}</strong> of {questions.length}
            </div>
            <button
              type="button"
              onClick={onExit}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                borderRadius: '6px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <LogOut size={13} /> Exit Interview
            </button>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div style={{ width: '100%', background: 'rgba(255, 255, 255, 0.15)', borderRadius: '4px', height: '6px' }}>
          <div
            style={{
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
              borderRadius: '4px',
              height: '100%',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      {currentQuestion && (
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Meta Tags */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Badge variant="primary">{currentQuestion.category || 'Core Concept'}</Badge>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    background: '#f1f5f9',
                    color: 'var(--text-secondary)',
                    textTransform: 'capitalize',
                    fontWeight: 600,
                  }}
                >
                  Level: {currentQuestion.difficulty || 'Intermediate'}
                </span>
              </div>

              {/* Hint Toggle */}
              {currentQuestion.hint && (
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-amber)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Lightbulb size={14} />
                  {showHint ? 'Hide Thinking Framework' : '💡 Show Thinking Framework'}
                  {showHint ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}
            </div>

            {/* Question Text */}
            <div
              style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: '1.5',
                padding: '0.5rem 0',
              }}
            >
              {currentQuestion.question_text}
            </div>

            {/* Expandable Hint Box */}
            {showHint && currentQuestion.hint && (
              <div
                style={{
                  padding: '0.85rem 1rem',
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: 'var(--radius-md)',
                  color: '#92400e',
                  fontSize: '0.85rem',
                  lineHeight: '1.45',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                }}
              >
                <Lightbulb size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Interviewer Framework Guidance:</strong> {currentQuestion.hint}
                </div>
              </div>
            )}

            {/* Evaluation Criteria Pills */}
            {currentQuestion.evaluation_criteria && currentQuestion.evaluation_criteria.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                  KEY EVALUATION FOCUS:
                </span>
                {currentQuestion.evaluation_criteria.map((crit, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.72rem',
                      background: '#f1f5f9',
                      color: '#475569',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      fontWeight: 500,
                    }}
                  >
                    • {crit}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Answer Input Section (if not yet evaluated for this question) */}
      {!currentEval ? (
        <Card title="Your Answer Response">
          <form onSubmit={handleAnswerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <textarea
                rows={6}
                placeholder="Structure your answer clearly. Explain your technical reasoning, provide concrete examples, and discuss tradeoffs..."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                disabled={isEvaluating}
                className="form-input"
                style={{
                  width: '100%',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  padding: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
                autoFocus
              />

              {/* Bottom Textarea Toolbar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '0.4rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <div>
                  {wordCount} words • {currentAnswer.length} characters
                </div>

                {/* Voice Dictation Button */}
                {speechSupported && (
                  <button
                    type="button"
                    onClick={toggleSpeech}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: isListening ? '#fee2e2' : '#f1f5f9',
                      color: isListening ? '#dc2626' : '#475569',
                      border: isListening ? '1px solid #f87171' : '1px solid #e2e8f0',
                      padding: '0.3rem 0.65rem',
                      borderRadius: '999px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isListening ? (
                      <>
                        <MicOff size={13} /> Recording (Click to Stop)
                      </>
                    ) : (
                      <>
                        <Mic size={13} /> Voice Dictation
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Submit Action Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={isEvaluating || !currentAnswer.trim()}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: isEvaluating || !currentAnswer.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                  opacity: isEvaluating || !currentAnswer.trim() ? 0.65 : 1,
                }}
              >
                {isEvaluating ? (
                  <>
                    <span className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#ffffff' }} />
                    AI Evaluating Answer...
                  </>
                ) : (
                  <>
                    <Send size={15} /> Submit Response
                  </>
                )}
              </button>
            </div>
          </form>
        </Card>
      ) : (
        /* Real-Time AI Evaluation Feedback Card */
        <div
          style={{
            padding: '1.5rem',
            background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid #cbd5e1',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* Header Score Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="#4f46e5" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Instant AI Answer Evaluation
              </h3>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                background: currentEval.score >= 8 ? '#ecfdf5' : currentEval.score >= 6 ? '#fffbeb' : '#fee2e2',
                border: currentEval.score >= 8 ? '1px solid #a7f3d0' : currentEval.score >= 6 ? '1px solid #fde68a' : '1px solid #fca5a5',
                color: currentEval.score >= 8 ? '#065f46' : currentEval.score >= 6 ? '#92400e' : '#991b1b',
                fontWeight: 800,
                fontSize: '0.95rem',
              }}
            >
              Score: {currentEval.score} / 10
            </div>
          </div>

          {/* Candidate Submitted Answer Snapshot */}
          <div
            style={{
              padding: '0.85rem 1rem',
              background: '#ffffff',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #e2e8f0',
              fontSize: '0.85rem',
              color: '#334155',
              lineHeight: '1.5',
              fontStyle: 'italic',
            }}
          >
            "{currentAnswer}"
          </div>

          {/* Strengths & Improvements Grid */}
          <div
            className="grid-responsive"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
            }}
          >
            {/* Strengths */}
            <div
              style={{
                padding: '1rem',
                background: '#f0fdf4',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #bbf7d0',
              }}
            >
              <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={15} /> Confirmed Strengths
              </div>
              <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.8rem', color: '#1e293b', lineHeight: '1.5' }}>
                {currentEval.strengths?.map((st, idx) => (
                  <li key={idx} style={{ marginBottom: '0.25rem' }}>
                    {st}
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div
              style={{
                padding: '1rem',
                background: '#fffbeb',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #fde68a',
              }}
            >
              <div style={{ fontWeight: 700, color: '#b45309', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={15} /> Areas for Improvement
              </div>
              <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.8rem', color: '#1e293b', lineHeight: '1.5' }}>
                {currentEval.improvements?.map((imp, idx) => (
                  <li key={idx} style={{ marginBottom: '0.25rem' }}>
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Next Question Navigation Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={handleNextQuestion}
              disabled={isCompleting}
              style={{
                padding: '0.8rem 1.6rem',
                background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: isCompleting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
              }}
            >
              {isCompleting ? (
                <>
                  <span className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#ffffff' }} />
                  Synthesizing Final Performance Report...
                </>
              ) : currentIndex < questions.length - 1 ? (
                <>
                  Next Question ({currentIndex + 2}/{questions.length}) <ArrowRight size={16} />
                </>
              ) : (
                <>
                  Finish & View Performance Report <Sparkles size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

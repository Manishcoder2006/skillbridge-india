import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useAILearningTutor Hook
 * Browser-native SpeechSynthesis for AI Micro-Learning Tutor.
 * Provides play, pause, resume, replay, sentence-level sync tracking, and cleanup.
 */
export const useAILearningTutor = ({ targetLang = 'en-IN' } = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(0);

  const sentencesRef = useRef([]);
  const onEndCallbackRef = useRef(null);
  const sentenceTimerRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSupported(true);
    } else {
      setSpeechSupported(false);
    }
  }, []);

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (sentenceTimerRef.current) {
      clearInterval(sentenceTimerRef.current);
      sentenceTimerRef.current = null;
    }
    setIsSpeaking(false);
    setIsPaused(false);
    setActiveSentenceIndex(0);
  }, []);

  const pauseSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    }
  }, []);

  const resumeSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      }
    }
  }, []);

  const speakLesson = useCallback(
    (script, onEnd) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setIsSpeaking(false);
        if (onEnd) onEnd();
        return;
      }

      // Stop any prior speech
      window.speechSynthesis.cancel();
      if (sentenceTimerRef.current) {
        clearInterval(sentenceTimerRef.current);
        sentenceTimerRef.current = null;
      }

      if (!script || !script.trim()) {
        setIsSpeaking(false);
        if (onEnd) onEnd();
        return;
      }

      // Parse sentences for synchronized visual highlighting
      const sentences = script
        .split(/(?<=[.?!])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      sentencesRef.current = sentences;
      setActiveSentenceIndex(0);
      onEndCallbackRef.current = onEnd;

      const utterance = new SpeechSynthesisUtterance(script);
      utterance.rate = 0.95; // Pleasant, educational narration pace
      utterance.pitch = 1.0;
      utterance.lang = targetLang;

      // Select natural voice
      const voices = window.speechSynthesis.getVoices() || [];
      const preferredVoice =
        voices.find((v) => v.lang === 'en-IN' && v.name.includes('Natural')) ||
        voices.find((v) => v.lang === 'en-IN') ||
        voices.find((v) => (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Karen')) && v.lang.startsWith('en')) ||
        voices.find((v) => v.lang.startsWith('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);

        // Estimate sentence progression for synchronized highlighting
        if (sentences.length > 1) {
          const totalWords = script.split(/\s+/).length;
          // Approximate speech rate ~ 130 words per minute (2.16 words/sec)
          const estimatedSeconds = Math.max(8, Math.round(totalWords / 2.16));
          const stepIntervalMs = Math.round((estimatedSeconds * 1000) / sentences.length);

          let currentStep = 0;
          sentenceTimerRef.current = setInterval(() => {
            currentStep += 1;
            if (currentStep < sentences.length) {
              setActiveSentenceIndex(currentStep);
            } else {
              if (sentenceTimerRef.current) {
                clearInterval(sentenceTimerRef.current);
                sentenceTimerRef.current = null;
              }
            }
          }, stepIntervalMs);
        }
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        if (sentenceTimerRef.current) {
          clearInterval(sentenceTimerRef.current);
          sentenceTimerRef.current = null;
        }
        setActiveSentenceIndex(sentences.length > 0 ? sentences.length - 1 : 0);
        if (onEndCallbackRef.current) {
          onEndCallbackRef.current();
        }
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error/interrupted:', e);
        setIsSpeaking(false);
        setIsPaused(false);
        if (sentenceTimerRef.current) {
          clearInterval(sentenceTimerRef.current);
          sentenceTimerRef.current = null;
        }
        if (onEndCallbackRef.current) {
          onEndCallbackRef.current();
        }
      };

      setIsSpeaking(true);
      setIsPaused(false);
      window.speechSynthesis.speak(utterance);
    },
    [targetLang]
  );

  // Stop speech on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, [stopSpeech]);

  return {
    isSpeaking,
    isPaused,
    speechSupported,
    activeSentenceIndex,
    sentences: sentencesRef.current,
    speakLesson,
    pauseSpeech,
    resumeSpeech,
    stopSpeech,
  };
};

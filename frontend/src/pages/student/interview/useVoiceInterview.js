import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useVoiceInterview Hook
 * Handles browser-native Camera, Microphone, Text-to-Speech, and Speech-to-Text.
 * Zero paid APIs. 100% browser-native Web APIs.
 */
export const useVoiceInterview = ({ onAnswerSpoken, targetLang = 'en-IN' } = {}) => {
  // --- Media & Device States ---
  const [stream, setStream] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [mediaPermissionState, setMediaPermissionState] = useState('idle'); // 'idle' | 'requesting' | 'granted' | 'denied'
  const [mediaError, setMediaError] = useState(null);
  const [audioVolume, setAudioVolume] = useState(0); // 0 - 100 speaking activity

  // --- Voice / Text-to-Speech (AI Interviewer) ---
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(true);

  // --- Speech-to-Text (Candidate Verbal Answers) ---
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [sttSupported, setSttSupported] = useState(false);
  const [sttError, setSttError] = useState(null);

  // Refs for persistent instances and cleanup
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const accumulatedTranscriptRef = useRef('');
  const onAnswerCallbackRef = useRef(onAnswerSpoken);
  onAnswerCallbackRef.current = onAnswerSpoken;

  // ---------------------------------------------------------------------------
  // 1. Media Stream (Webcam & Microphone)
  // ---------------------------------------------------------------------------
  const startCamera = useCallback(async () => {
    try {
      setMediaPermissionState('requesting');
      setMediaError(null);

      // Stop any existing tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setIsCameraOn(true);
      setIsMicMuted(false);
      setMediaPermissionState('granted');

      // Initialize Audio Visualizer / Volume Level meter
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          const source = audioCtx.createMediaStreamSource(mediaStream);
          source.connect(analyser);

          audioContextRef.current = audioCtx;
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateVolume = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            const normalized = Math.min(100, Math.round((average / 128) * 100));
            setAudioVolume(normalized);
            animFrameRef.current = requestAnimationFrame(updateVolume);
          };
          updateVolume();
        }
      } catch (err) {
        console.warn('AudioContext volume meter init ignored:', err);
      }

      return mediaStream;
    } catch (err) {
      console.error('Failed to access camera & microphone:', err);
      setMediaPermissionState('denied');
      let msg = 'Could not access camera or microphone.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera/Microphone permission was denied. Please allow camera and mic permissions in browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera or microphone found on this device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg = 'Camera or microphone is already in use by another application.';
      }
      setMediaError(msg);
      return null;
    }
  }, []);

  const toggleCamera = useCallback(() => {
    if (!streamRef.current) return;
    const videoTracks = streamRef.current.getVideoTracks();
    if (videoTracks.length > 0) {
      const nextState = !videoTracks[0].enabled;
      videoTracks.forEach((t) => {
        t.enabled = nextState;
      });
      setIsCameraOn(nextState);
    }
  }, []);

  const toggleMicrophone = useCallback(() => {
    if (!streamRef.current) return;
    const audioTracks = streamRef.current.getAudioTracks();
    if (audioTracks.length > 0) {
      const nextMute = audioTracks[0].enabled; // If enabled, toggling means muting
      audioTracks.forEach((t) => {
        t.enabled = !nextMute;
      });
      setIsMicMuted(nextMute);
    }
  }, []);

  const stopAllMediaTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
      setStream(null);
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioVolume(0);
  }, []);

  // ---------------------------------------------------------------------------
  // 2. Text-to-Speech (AI Speaking)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setTtsSupported(true);
    } else {
      setTtsSupported(false);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsAISpeaking(false);
  }, []);

  const speakText = useCallback(
    (text, onComplete) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setIsAISpeaking(false);
        if (onComplete) onComplete();
        return;
      }

      // Stop any existing speech
      window.speechSynthesis.cancel();

      if (!text || !text.trim()) {
        setIsAISpeaking(false);
        if (onComplete) onComplete();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = targetLang;

      // Select natural voice if available
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
        setIsAISpeaking(true);
      };

      utterance.onend = () => {
        setIsAISpeaking(false);
        if (onComplete) onComplete();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error/interrupted:', e);
        setIsAISpeaking(false);
        if (onComplete) onComplete();
      };

      setIsAISpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [targetLang]
  );

  // ---------------------------------------------------------------------------
  // 3. Speech-to-Text (Candidate Spoken Answer Transcription)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSttSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = targetLang;
      recognitionRef.current = recognition;
    } else {
      setSttSupported(false);
    }
  }, [targetLang]);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const finishListeningAndSubmit = useCallback(() => {
    clearSilenceTimer();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
    }
    setIsListening(false);
    setInterimTranscript('');

    const finalAnswer = accumulatedTranscriptRef.current.trim();
    if (onAnswerCallbackRef.current && finalAnswer) {
      onAnswerCallbackRef.current(finalAnswer);
    }
  }, [clearSilenceTimer]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setSttError('Speech recognition is not supported on this browser. You can speak or use voice-capable browsers like Chrome/Edge.');
      return;
    }

    // Stop speaking if AI was speaking
    stopSpeaking();

    // Reset transcripts
    setTranscript('');
    setInterimTranscript('');
    accumulatedTranscriptRef.current = '';
    setSttError(null);

    const recognition = recognitionRef.current;

    recognition.onresult = (event) => {
      let interim = '';
      let currentFinal = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        if (item.isFinal) {
          currentFinal += item[0].transcript + ' ';
        } else {
          interim += item[0].transcript;
        }
      }

      if (currentFinal) {
        accumulatedTranscriptRef.current = (accumulatedTranscriptRef.current + ' ' + currentFinal).replace(/\s+/g, ' ').trim();
        setTranscript(accumulatedTranscriptRef.current);
      }
      setInterimTranscript(interim);

      // Auto-silence detection:
      // If the candidate spoke meaningful words (> 6 words) and stops for 3.8 seconds, automatically submit
      clearSilenceTimer();
      const currentFullText = (accumulatedTranscriptRef.current + ' ' + interim).trim();
      const wordCount = currentFullText.split(/\s+/).filter(Boolean).length;
      if (wordCount >= 6) {
        silenceTimerRef.current = setTimeout(() => {
          finishListeningAndSubmit();
        }, 3800);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        // Normal silence timeout, no crash
        return;
      }
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setSttError('Microphone access blocked for speech recognition.');
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      // Check if we were actively supposed to be listening and user didn't manually finish
      // Web speech sometimes stops unexpectedly; if transcript is still accumulating, we handle gracefully
    };

    try {
      recognition.start();
      setIsListening(true);
    } catch (err) {
      // Already running or error
      setIsListening(true);
    }
  }, [stopSpeaking, clearSilenceTimer, finishListeningAndSubmit]);

  const stopListening = useCallback(() => {
    finishListeningAndSubmit();
  }, [finishListeningAndSubmit]);

  // Clean up all resources on unmount
  useEffect(() => {
    return () => {
      stopAllMediaTracks();
      stopSpeaking();
      clearSilenceTimer();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {}
      }
    };
  }, [stopAllMediaTracks, stopSpeaking, clearSilenceTimer]);

  return {
    // Media & Camera
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

    // Text-to-Speech (AI Speaking)
    isAISpeaking,
    ttsSupported,
    speakText,
    stopSpeaking,

    // Speech-to-Text (Candidate Spoken Answers)
    isListening,
    transcript,
    interimTranscript,
    currentSpokenText: (transcript + ' ' + interimTranscript).trim(),
    sttSupported,
    sttError,
    startListening,
    stopListening,
  };
};

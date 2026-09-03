import React from 'react';
import { VoiceVideoInterviewScreen } from './VoiceVideoInterviewScreen';

/**
 * AI Interview Simulator Screen
 * Real-time Voice + Video AI Interview experience (Google Meet / Zoom style)
 * Fully powered by browser-native MediaDevices, SpeechSynthesis, and SpeechRecognition APIs.
 */
export const InterviewScreen = (props) => {
  return <VoiceVideoInterviewScreen {...props} />;
};

export default InterviewScreen;

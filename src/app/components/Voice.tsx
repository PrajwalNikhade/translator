"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Play, Pause, Square, Volume2, Download, Loader } from 'lucide-react';
import { languages } from '../lib/languages';

interface VoiceTranslationProps {
  className?: string;
}

export default function VoiceTranslation({ className = '' }: VoiceTranslationProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [transcribedText, setTranscribedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [translatedAudio, setTranslatedAudio] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('hi');
  const [error, setError] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      setError('Failed to access microphone. Please check permissions.');
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const processAudio = async () => {
    if (!recordedBlob) return;

    setIsProcessing(true);
    setError('');

    try {
      // Step 1: Convert speech to text
      const formData = new FormData();
      formData.append('audio', recordedBlob, 'recording.webm');

      const speechResponse = await fetch('/api/speech_to_text', {
        method: 'POST',
        body: formData,
      });

      if (!speechResponse.ok) {
        throw new Error('Speech recognition failed');
      }

      const speechData = await speechResponse.json();
      const transcribed = speechData.text || '';
      setTranscribedText(transcribed);

      if (!transcribed.trim()) {
        setError('No speech detected. Please try recording again.');
        return;
      }

      // Step 2: Translate text
      const translateResponse = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: transcribed,
          tgtLang: targetLanguage,
        }),
      });

      if (!translateResponse.ok) {
        throw new Error('Translation failed');
      }

      const translateData = await translateResponse.json();
      const translated = translateData.result || '';
      setTranslatedText(translated);

      if (!translated.trim()) {
        setError('Translation failed. Please try again.');
        return;
      }

      // Step 3: Convert translated text to speech
      const ttsResponse = await fetch('/api/text_to_speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: translated,
          modelID: "espnet/kan-bayashi-ljspeech_tacotron2"
        }),
      });

      if (!ttsResponse.ok) {
        throw new Error('Text-to-speech conversion failed');
      }

      const audioBlob = await ttsResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      setTranslatedAudio(audioUrl);

    } catch (err: any) {
      setError(err.message || 'Processing failed. Please try again.');
      console.error('Processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const playTranslatedAudio = () => {
    if (translatedAudio && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const downloadAudio = () => {
    if (translatedAudio) {
      const a = document.createElement('a');
      a.href = translatedAudio;
      a.download = `translation_${targetLanguage}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const reset = () => {
    setRecordedBlob(null);
    setTranscribedText('');
    setTranslatedText('');
    setTranslatedAudio(null);
    setError('');
    setRecordingTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 ${className}`}>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mic className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Voice Translation
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Speak naturally and get instant voice translations
        </p>
      </div>

      {/* Target Language Selection */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Translate to:
        </label>
        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          className="w-full p-4 bg-white/50 dark:bg-gray-700/50 border border-gray-300/50 dark:border-gray-600/50 rounded-xl backdrop-blur-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
        >
          {languages.filter(lang => lang.code !== 'auto').map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Recording Controls */}
      <div className="text-center mb-8">
        {!recordedBlob ? (
          <div className="space-y-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`w-24 h-24 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
              }`}
            >
              {isRecording ? (
                <Square className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </button>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {isRecording ? 'Recording...' : 'Press to Record'}
              </p>
              {isRecording && (
                <p className="text-purple-600 dark:text-purple-400 text-2xl font-mono">
                  {formatTime(recordingTime)}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center space-x-4">
              <button
                onClick={processAudio}
                disabled={isProcessing}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold flex items-center"
              >
                {isProcessing ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    Processing...
                  </>
                ) : (
                  'Translate Recording'
                )}
              </button>
              <button
                onClick={reset}
                className="bg-gray-600 text-white px-8 py-4 rounded-xl hover:bg-gray-700 transition-all duration-200 font-semibold"
              >
                Record Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {(transcribedText || translatedText) && (
        <div className="space-y-6">
          {/* Original Text */}
          {transcribedText && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                What you said:
              </h3>
              <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                {transcribedText}
              </p>
            </div>
          )}

          {/* Translated Text */}
          {translatedText && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">
                Translation:
              </h3>
              <p className="text-green-800 dark:text-green-200 leading-relaxed mb-4">
                {translatedText}
              </p>
              
              {/* Audio Controls */}
              {translatedAudio && (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={playTranslatedAudio}
                    className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 transition-colors"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={downloadAudio}
                    className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 transition-colors"
                    title="Download Audio"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                  <Volume2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-700 dark:text-green-300">
                    Click play to hear translation
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-xl">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Hidden audio element for playback */}
      {translatedAudio && (
        <audio
          ref={audioRef}
          src={translatedAudio}
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          style={{ display: 'none' }}
        />
      )}

      {/* Instructions */}
      <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">How it works:</h4>
        <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
          <li>Select your target language</li>
          <li>Click the microphone button to start recording</li>
          <li>Speak clearly into your microphone</li>
          <li>Click stop when finished</li>
          <li>Click "Translate Recording" to process your speech</li>
          <li>Listen to the translated audio or download it</li>
        </ol>
      </div>
    </div>
  );
}
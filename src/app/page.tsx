'use client';

import { useState } from 'react';
import TranslationInterface from './components/TranslationInterface';
import { languages } from './lib/languages';
import FileUpload from './components/FileUpload';
import Voice from './components/Voice';
export default function LanguageTranslator() {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const translateText = async () => {
    if (!inputText.trim()) {
      setError('Please enter text to translate');
      return;
    }

    setIsTranslating(true);
    setError('');

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          srcLang: sourceLanguage,  // Changed from 'source'
          tgtLang: targetLanguage,  // Changed from 'target'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTranslatedText(data.result);  // Changed from data.translatedText
      } else {
        throw new Error(data.error || 'Translation failed');
      }
    } catch (err) {
      setError('Translation failed. Please try again.');
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      translateText();
    }
  };

  const swapLanguages = () => {
    if (sourceLanguage !== 'auto') {
      setSourceLanguage(targetLanguage);
      setTargetLanguage(sourceLanguage);
      setInputText(translatedText);
      setTranslatedText(inputText);
    }
  };

  const clearText = () => {
    setInputText('');
    setTranslatedText('');
    setError('');
    setCopySuccess('');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <TranslationInterface
        inputText={inputText}
        setInputText={setInputText}
        translatedText={translatedText}
        setTranslatedText={setTranslatedText}
        sourceLanguage={sourceLanguage}
        setSourceLanguage={setSourceLanguage}
        targetLanguage={targetLanguage}
        setTargetLanguage={setTargetLanguage}
        isTranslating={isTranslating}
        error={error}
        copySuccess={copySuccess}
        translateText={translateText}
        handleKeyPress={handleKeyPress}
        swapLanguages={swapLanguages}
        copyToClipboard={copyToClipboard}
        languages={languages}
      />
      <FileUpload
        onFileSelect={async (file: File) => {
          const text = await file.text();
          setInputText(text);
        }}
        acceptedTypes={['text/plain']}
        maxSize={10}
      />
      <Voice/>
    </div>
  );
}


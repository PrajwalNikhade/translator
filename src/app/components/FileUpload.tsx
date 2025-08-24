import React, { useState, useRef } from 'react';
import { FileText, Upload, Download, AlertCircle, CheckCircle, Loader, X, Eye } from 'lucide-react';
import { languages } from '../lib/languages';

interface PDFTranslationProps {
  className?: string;
}

export default function PDFTranslation({ className = '' }: PDFTranslationProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('hi');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [translatedContent, setTranslatedContent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [previewText, setPreviewText] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);

  const validateFile = (file: File): boolean => {
    setError('');
    
    // Check file type
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file');
      return false;
    }
    
    // Check file size (50MB limit)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 50) {
      setError('File size must be less than 50MB');
      return false;
    }
    
    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      setTranslatedContent('');
      setSuccess('');
      setPreviewText('');
      setShowPreview(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setTranslatedContent('');
    setError('');
    setSuccess('');
    setPreviewText('');
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const previewPDF = async () => {
    if (!selectedFile) return;

    setError('');
    const formData = new FormData();
    formData.append('pdf', selectedFile);
    formData.append('preview', 'true');

    try {
      // This would need a preview endpoint or we can show first few lines after translation
      const response = await fetch('/api/pdf/translate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to preview PDF content');
      }

      const text = await response.text();
      const previewLines = text.split('\n').slice(0, 10).join('\n');
      setPreviewText(previewLines + (text.split('\n').length > 10 ? '\n...' : ''));
      setShowPreview(true);
    } catch (err: any) {
      setError('Failed to preview PDF. The file may be corrupted or password-protected.');
    }
  };

  const translatePDF = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file');
      return;
    }

    setIsTranslating(true);
    setError('');
    setSuccess('');
    setTranslationProgress(0);

    const formData = new FormData();
    formData.append('pdf', selectedFile);
    formData.append('tgtLang', targetLanguage);
    if (sourceLanguage) {
      formData.append('srcLang', sourceLanguage);
    }

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setTranslationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      const response = await fetch('/api/pdf/translate', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setTranslationProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Translation failed' }));
        throw new Error(errorData.error || 'Translation failed');
      }

      // The API returns the translated text directly
      const translatedText = await response.text();
      setTranslatedContent(translatedText);
      setSuccess(`PDF translated successfully! ${Math.round(translatedText.length / 1000)}k characters processed.`);
      
      // Auto-download the translated file
      const blob = new Blob([translatedText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = downloadLinkRef.current;
      if (link) {
        link.href = url;
        link.download = `translated_${selectedFile.name.replace('.pdf', '')}_${targetLanguage}.txt`;
        link.click();
        URL.revokeObjectURL(url);
      }

    } catch (err: any) {
      setError(err.message || 'Translation failed. Please try again.');
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
      setTimeout(() => setTranslationProgress(0), 2000);
    }
  };

  const downloadTranslation = () => {
    if (!translatedContent) return;

    const blob = new Blob([translatedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = downloadLinkRef.current;
    if (link) {
      link.href = url;
      link.download = `translated_${selectedFile?.name.replace('.pdf', '') || 'document'}_${targetLanguage}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 ${className}`}>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          PDF Translation
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Upload PDF documents and translate them while preserving structure
        </p>
      </div>

      {/* File Upload Area */}
      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 mb-6 ${
            dragOver
              ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Upload PDF Document
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Drag and drop your PDF here, or click to browse
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-lg hover:from-red-600 hover:to-orange-600 transition-colors font-semibold"
          >
            Choose PDF File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={handleFileInput}
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Supported format: PDF • Max size: 50MB
          </p>
        </div>
      ) : (
        /* Selected File Display */
        <div className="bg-white dark:bg-gray-700 rounded-xl border-2 border-green-200 dark:border-green-800 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedFile.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatFileSize(selectedFile.size)} • PDF Document
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={previewPDF}
                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Preview content"
              >
                <Eye className="w-5 h-5" />
              </button>
              <CheckCircle className="w-6 h-6 text-green-500" />
              <button
                onClick={removeFile}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                title="Remove file"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Section */}
      {showPreview && previewText && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Document Preview
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-h-48 overflow-y-auto">
            <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
              {previewText}
            </pre>
          </div>
        </div>
      )}

      {/* Language Selection */}
      {selectedFile && (
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Source Language (Optional - Auto-detect if empty)
            </label>
            <select
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
              className="w-full p-4 bg-white/50 dark:bg-gray-700/50 border border-gray-300/50 dark:border-gray-600/50 rounded-xl backdrop-blur-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
            >
              <option value="">Auto-detect</option>
              {languages.filter(lang => lang.code !== 'auto').map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Target Language
            </label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full p-4 bg-white/50 dark:bg-gray-700/50 border border-gray-300/50 dark:border-gray-600/50 rounded-xl backdrop-blur-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
            >
              {languages.filter(lang => lang.code !== 'auto').map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Translation Controls */}
      {selectedFile && (
        <div className="text-center mb-8">
          <button
            onClick={translatePDF}
            disabled={isTranslating}
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-4 rounded-xl hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg transform hover:scale-105 flex items-center mx-auto"
          >
            {isTranslating ? (
              <>
                <Loader className="animate-spin h-6 w-6 mr-3" />
                Translating PDF...
              </>
            ) : (
              <>
                <FileText className="h-6 w-6 mr-3" />
                Translate PDF
              </>
            )}
          </button>
        </div>
      )}

      {/* Progress Bar */}
      {isTranslating && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Translation Progress
            </span>
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              {Math.round(translationProgress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-red-500 to-orange-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${translationProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
            Processing your PDF document... This may take a few minutes for large files.
          </p>
        </div>
      )}

      {/* Results Section */}
      {translatedContent && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
              Translation Complete
            </h3>
            <button
              onClick={downloadTranslation}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center font-semibold"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto">
            <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {translatedContent.length > 1000 
                ? `${translatedContent.substring(0, 1000)}...\n\n[Content truncated - Full translation available in download]`
                : translatedContent
              }
            </pre>
          </div>

          <div className="flex items-center justify-between text-sm text-green-700 dark:text-green-300">
            <span>Characters: {translatedContent.length.toLocaleString()}</span>
            <span>Words: ~{Math.round(translatedContent.split(/\s+/).length).toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-xl">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 rounded-xl">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{success}</span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">How to use PDF Translation:</h4>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Supported Features:</h5>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Text-based PDF documents</li>
              <li>• Auto language detection</li>
              <li>• Large file processing (up to 50MB)</li>
              <li>• Preserves text structure</li>
              <li>• Multiple output formats</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Tips for best results:</h5>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Use clear, high-quality PDF files</li>
              <li>• Avoid password-protected PDFs</li>
              <li>• Scanned documents may have lower accuracy</li>
              <li>• Complex formatting may be simplified</li>
              <li>• Large files may take several minutes</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> The translation preserves the text content but may not maintain exact formatting. 
            For documents requiring precise layout, consider using the text translation feature for specific sections.
          </p>
        </div>
      </div>

      {/* Hidden download link */}
      <a
        ref={downloadLinkRef}
        style={{ display: 'none' }}
        download
      />
    </div>
  );
}
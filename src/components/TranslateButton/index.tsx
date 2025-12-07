import React, { useState } from 'react';
import styles from './styles.module.css';

const API_URL = 'http://localhost:3001';

interface TranslateButtonProps {
  className?: string;
}

export default function TranslateButton({ className }: TranslateButtonProps): JSX.Element {
  const [isTranslating, setIsTranslating] = useState(false);
  const [isUrdu, setIsUrdu] = useState(false);
  const [originalContent, setOriginalContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const translatePage = async () => {
    setError(null);

    if (isUrdu && originalContent) {
      // Switch back to English
      const articleElement = document.querySelector('article.markdown');
      if (articleElement) {
        articleElement.innerHTML = originalContent;
        document.documentElement.dir = 'ltr';
        document.documentElement.lang = 'en';
      }
      setIsUrdu(false);
      setOriginalContent(null);
      return;
    }

    setIsTranslating(true);

    try {
      const articleElement = document.querySelector('article.markdown');
      if (!articleElement) {
        throw new Error('Content not found');
      }

      // Store original content
      setOriginalContent(articleElement.innerHTML);

      // Get text content for translation
      const textContent = articleElement.textContent || '';

      // Split into chunks if too long (max 4000 chars per request)
      const maxChunkSize = 3500;
      const chunks: string[] = [];

      if (textContent.length > maxChunkSize) {
        const paragraphs = textContent.split('\n\n');
        let currentChunk = '';

        for (const para of paragraphs) {
          if ((currentChunk + para).length > maxChunkSize) {
            if (currentChunk) chunks.push(currentChunk);
            currentChunk = para;
          } else {
            currentChunk += (currentChunk ? '\n\n' : '') + para;
          }
        }
        if (currentChunk) chunks.push(currentChunk);
      } else {
        chunks.push(textContent);
      }

      // Translate all chunks
      const translatedChunks: string[] = [];

      for (const chunk of chunks) {
        const response = await fetch(`${API_URL}/api/translate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: chunk,
            targetLanguage: 'ur',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Translation failed');
        }

        const data = await response.json();
        translatedChunks.push(data.translatedText);
      }

      // Combine translated content
      const translatedText = translatedChunks.join('\n\n');

      // Create styled Urdu content
      const urduContent = document.createElement('div');
      urduContent.className = styles.urduContent;
      urduContent.innerHTML = `
        <div class="${styles.translationNotice}">
          <span>This content has been translated to Urdu using AI. Technical terms are preserved in English.</span>
        </div>
        <div class="${styles.urduText}">${translatedText.replace(/\n/g, '<br/>')}</div>
      `;

      articleElement.innerHTML = '';
      articleElement.appendChild(urduContent);

      // Set RTL direction
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ur';

      setIsUrdu(true);
    } catch (err) {
      console.error('Translation error:', err);
      setError(err instanceof Error ? err.message : 'Translation failed. Make sure the API server is running.');
      // Restore original content if translation fails
      if (originalContent) {
        const articleElement = document.querySelector('article.markdown');
        if (articleElement) {
          articleElement.innerHTML = originalContent;
        }
        setOriginalContent(null);
      }
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <button
        className={`${styles.translateButton} ${isUrdu ? styles.active : ''}`}
        onClick={translatePage}
        disabled={isTranslating}
        title={isUrdu ? 'Switch to English' : 'Translate to Urdu'}
      >
        {isTranslating ? (
          <>
            <span className={styles.spinner}></span>
            Translating...
          </>
        ) : isUrdu ? (
          <>
            <span className={styles.icon}>EN</span>
            English
          </>
        ) : (
          <>
            <span className={styles.icon}>اردو</span>
            Urdu
          </>
        )}
      </button>
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}
    </div>
  );
}

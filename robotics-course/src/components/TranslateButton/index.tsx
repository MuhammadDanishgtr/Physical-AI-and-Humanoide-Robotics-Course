import React, { useState } from 'react';
import styles from './styles.module.css';

// Determine API URL based on environment
// Production (Vercel): use relative path which calls /api/translate
// Development: use localhost:3001 for the Express server
const getApiUrl = (): string => {
  if (typeof window === 'undefined') return '';

  const hostname = window.location.hostname;
  // Check for localhost, 127.0.0.1, or any local development
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('192.168.')) {
    return 'http://localhost:3001';
  }
  // Production - use relative path for Vercel serverless functions
  return '';
};

interface TranslateButtonProps {
  className?: string;
}

// Find the main content element in Docusaurus pages
// Docusaurus uses different selectors for docs vs blog vs custom pages
const findContentElement = (): Element | null => {
  // Try multiple selectors in order of specificity
  const selectors = [
    'div.markdown',                    // Docusaurus docs and blog content
    'article .markdown',               // Blog post wrapper
    '.theme-doc-markdown',             // Docusaurus theme class
    'article[class*="markdown"]',      // Any article with markdown class
    'main article',                    // Generic main article
    '.docMainContainer article',       // Docs main container
    'main .container',                 // Fallback to main container
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent?.trim()) {
      return element;
    }
  }
  return null;
};

export default function TranslateButton({ className }: TranslateButtonProps): JSX.Element {
  const [isTranslating, setIsTranslating] = useState(false);
  const [isUrdu, setIsUrdu] = useState(false);
  const [originalContent, setOriginalContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const translatePage = async () => {
    setError(null);

    if (isUrdu && originalContent) {
      // Switch back to English
      const contentElement = findContentElement();
      if (contentElement) {
        contentElement.innerHTML = originalContent;
        document.documentElement.dir = 'ltr';
        document.documentElement.lang = 'en';
      }
      setIsUrdu(false);
      setOriginalContent(null);
      return;
    }

    setIsTranslating(true);

    try {
      const contentElement = findContentElement();
      if (!contentElement) {
        throw new Error('Content not found. Please navigate to a docs or blog page.');
      }

      // Store original content
      setOriginalContent(contentElement.innerHTML);

      // Get text content for translation
      const textContent = contentElement.textContent || '';

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
        const response = await fetch(`${getApiUrl()}/api/translate`, {
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

      contentElement.innerHTML = '';
      contentElement.appendChild(urduContent);

      // Set RTL direction
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ur';

      setIsUrdu(true);
    } catch (err) {
      console.error('Translation error:', err);
      setError(err instanceof Error ? err.message : 'Translation failed. Make sure the API server is running.');
      // Restore original content if translation fails
      if (originalContent) {
        const contentElement = findContentElement();
        if (contentElement) {
          contentElement.innerHTML = originalContent;
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

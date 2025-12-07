import React from 'react';
import { useLocation } from '@docusaurus/router';
import ChatbotWidget from '../components/ChatbotWidget';
import TranslateButton from '../components/TranslateButton';

interface Props {
  children: React.ReactNode;
}

export default function Root({ children }: Props): JSX.Element {
  const location = useLocation();
  const isDocsPage = location.pathname.startsWith('/docs');

  return (
    <>
      {children}
      <ChatbotWidget />
      {isDocsPage && <TranslateButton />}
    </>
  );
}

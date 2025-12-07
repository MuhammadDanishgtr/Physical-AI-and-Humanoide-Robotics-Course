import React from 'react';
import ChatbotWidget from '../components/ChatbotWidget';

interface Props {
  children: React.ReactNode;
}

export default function Root({ children }: Props): JSX.Element {
  return (
    <>
      {children}
      <ChatbotWidget />
    </>
  );
}

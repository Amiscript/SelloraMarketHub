import React from 'react';
import ChatWidget from '../chat/ChatWidget';

interface ChatLayoutProps {
  children: React.ReactNode;
  chatType: 'admin' | 'client' | 'store';
  storeName?: string;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ children, chatType, storeName }) => {
  return (
    <>
      {children}
      <ChatWidget type={chatType} storeName={storeName} />
    </>
  );
};

export default ChatLayout;
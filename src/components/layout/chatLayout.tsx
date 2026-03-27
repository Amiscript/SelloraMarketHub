import React from 'react';
import ChatWidget from '../chat/ChatWidget';

interface ChatLayoutProps {
  children: React.ReactNode;
  chatType: 'admin' | 'client' | 'store';
  storeName?: string;
  storeSlug?: string;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ children, chatType, storeName, storeSlug }) => {
  return (
    <>
      {children}
      <ChatWidget type={chatType} storeName={storeName} storeSlug={storeSlug} />
    </>
  );
};

export default ChatLayout;

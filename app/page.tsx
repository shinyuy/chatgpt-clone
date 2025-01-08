"use client"
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';


export default function Home() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  return (
    <div className="h-screen flex bg-gray-100">
      <Sidebar selectedConversation={selectedConversation} setSelectedConversation={setSelectedConversation} />
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <ChatArea conversationId={selectedConversation} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select or start a new conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}
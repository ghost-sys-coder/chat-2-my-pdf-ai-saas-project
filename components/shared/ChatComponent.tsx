"use client";
import React, { useState, useEffect, useRef } from 'react'
import { useChat } from "@ai-sdk/react"
import { Loader2, Send } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import axios from 'axios';



interface ChatProps {
  chatId: number;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  parts: [{ type: "text", text: string }]
}

const ChatComponent = ({ chatId }: ChatProps) => {
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [input, setInput] = useState<string>("");
  const { messages, sendMessage, status, setMessages } = useChat();

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // check if the AI is generating a response
  const isGenerating = status === "streaming";

  // fetch messages from database on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const { data } = await axios.get(`/api/chat/${chatId}`);
        if (data?.success && data?.messages) {
          // transform database messages to UI messages format
          const uiMessages = data?.messages.map((message: Message) => ({
            id: message.id,
            role: message.role,
            parts: [{ type: "text", text: message.content }]
          }));

          setMessages(uiMessages);
        }
      } catch (error) {
        console.error("Failed to fetch error", error);
      } finally {
        setIsLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [chatId, setMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className='relative overflow-auto flex flex-col h-full'>
      <div className="sticky top-0 bg-white z-10 inset-x-0 px-4 py-3 border-b shadow-sm">
        <h2 className='text-lg font-medium'>Chat Chat ID: {chatId}</h2>
      </div>

      <div className="flex-1 overflow-auto px-4 pt-4 pb-20 space-y-3">
        {messages.length === 0 && (
          <div className="p-2 flex rounded-lg w-full justify-end">
            <div className="max-w-[80%] text-sm leading-relaxed px-3 py-1.5 shadow-sm rounded-2xl bg-blue-600 text-white rounded-br-none">
              <div>How can I help you today?</div>
            </div>
          </div>
        )}
        {isLoadingMessages ? (
          <div className="flex justify-center items-center">
            <Loader2 className='h-4 w-4 animate-spin text-gray-400' />
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div key={index}
                className={cn("p-2 flex rounded-lg w-full",
                  message.role === "user" ? "justify-end" : "justify-start",)}
              >
                <div
                  className={cn("max-w-[80%] text-sm leading-relaxed px-3 py-1.5 shadow-sm rounded-2xl", {
                    "bg-blue-600 text-white rounded-br-none": message.role === "user",
                    "bg-white text-gray-900 rounded-bl-none border-none": message.role === "assistant"
                  })}>
                  {message.parts?.map((part, partIndex) => {
                    switch (part.type) {
                      case "text":
                        return <div key={`${message.id}-${partIndex}`}>{part.text}</div>
                    }
                  })}
                </div>
              </div>
            ))}
          </>
        )}

        {isGenerating && (
          <div className="flex justify-start p-2 rounded-lg w-full">
            <div className="max-w-[80%] text-sm leading-relaxed px-3 py-1.5 shadow-sm rounded-2xl bg-white text-gray-900 rounded-bl-none border-none flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-gray-500">AI is thinking...</span>
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage({ text: input, metadata: { chatId } });
          setInput("");
        }}
        className='p-4 absolute bottom-0 inset-x-0 bg-white border-t w-full flex gap-1'>
        <div className="flex items-center gap-1 w-full">
          <Input
            placeholder='Ask a question about your PDF...'
            className='flex-1 rounded-full border-gray-300 focus-visible:ring-blue-500'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isGenerating || isLoadingMessages}
          />
          <Button type='submit'
            size={"icon"}
            className='cursor-pointer h-10 w-10 rounded-full hover:opacity-80 transition-opacity'
            disabled={isLoadingMessages || isGenerating}
          >
            {isGenerating ? <Loader2 className='h-4 w-4 animate-spin' /> : <Send />}
          </Button>
        </div>
      </form>

      <div ref={bottomRef} />
    </div>
  )
}

export default ChatComponent
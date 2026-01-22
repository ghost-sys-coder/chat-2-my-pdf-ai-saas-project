"use client";
import React, { useState, useEffect, useRef } from 'react'
import { useChat } from "@ai-sdk/react"
import { Send } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';



interface ChatProps {
  chatId: number;
}

// interface Message {
//   role: "user" | "assistant";
//   content: string;
// }

const ChatComponent = ({ chatId }: ChatProps) => {
  const [input, setInput] = useState<string>("");
  const { messages, sendMessage } = useChat();

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className='relative overflow-auto flex flex-col h-full'>
      <div className="sticky top-0 bg-white z-10 inset-x-0 px-4 py-3 border-b shadow-sm">
        <h2 className='text-lg font-medium'>Chat Chat ID: {chatId}</h2>
      </div>

      <div className="flex-1 overflow-auto px-4 pt-4 pb-20 space-y-3">
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
          />
          <Button type='submit'
            size={"icon"}
            className='cursor-pointer h-10 w-10 rounded-full hover:opacity-80 transition-opacity'
          >
            <Send />
          </Button>
        </div>
      </form>

      <div ref={bottomRef} />
    </div>
  )
}

export default ChatComponent
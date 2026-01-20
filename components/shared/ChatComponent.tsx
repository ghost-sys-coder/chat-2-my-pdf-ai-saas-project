import React from 'react'
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Send } from 'lucide-react';

interface ChatProps {
  chatId: number;
}

const ChatComponent = ({chatId}: ChatProps) => {
  return (
    <div className='relative overflow-auto flex flex-col h-full'>
      <div className="sticky top-0 bg-white z-10 inset-x-0 px-4 py-3 border-b shadow-sm">
        <h2 className='text-lg font-medium'>Chat Component for Chat ID: {chatId}</h2>
      </div>

      <form className='p-4 absolute bottom-0 inset-x-0 bg-white border-t w-full flex gap-1'>
        <div className="flex items-center gap-1 w-full">
          <Input
          placeholder='Ask a question about your PDF...'
          className='flex-1 rounded-full border-gray-300 focus-visible:ring-blue-500'
        />
          <Button type='submit'
            size={"icon"}
            className='cursor-pointer h-10 w-10 rounded-full hover:opacity-80 transition-opacity'
          >
          <Send />
        </Button>
        </div>
      </form>
    </div>
  )
}

export default ChatComponent
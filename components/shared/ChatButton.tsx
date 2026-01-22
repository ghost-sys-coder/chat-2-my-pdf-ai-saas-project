import React from 'react'
import { Button } from '../ui/button'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { SignInButton } from '@clerk/nextjs'

const ChatButton = ({ isAuthenticated, chatId}: { isAuthenticated: boolean, chatId: number}) => {
  return (
    <div className="flex mt-4">
              {isAuthenticated ? (
                <Button asChild>
                  <Link href={`/chat/${chatId}`}>
                    <MessageCircle />
                    <span>Go to Chats</span></Link>
                </Button>
              ) : (
                <SignInButton mode="modal">
                  <Button>
                    <MessageCircle />
                    <span>Got to Chats</span>
                  </Button>
                </SignInButton>
              )}
            </div>
  )
}

export default ChatButton
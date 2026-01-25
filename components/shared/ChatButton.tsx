import React from 'react'
import { Button } from '../ui/button'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { SignInButton } from '@clerk/nextjs'
import { checkSubscription } from '@/lib/subscription'
import SubscriptionsBtn from './SubscriptionsBtn'


const ChatButton = async ({ isAuthenticated, chatId }: { isAuthenticated: boolean, chatId: number }) => {
  const { isValid } = await checkSubscription();


  return (
    <div className="flex mt-4">
      {isAuthenticated ? (
        <div className="flex gap-2 flex-col sm:flex-row">
          <Button asChild>
            <Link href={`/chat/${chatId}`}>
              <MessageCircle />
              <span>Go to Chats</span>
            </Link>
          </Button>
          <SubscriptionsBtn isValid={isValid} />
        </div>
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
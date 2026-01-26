import React from 'react'
import { Button } from '../ui/button'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { SignInButton } from '@clerk/nextjs'
import { checkSubscription } from '@/lib/subscription'
import SubscriptionsBtn from './SubscriptionsBtn'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { chatsTable } from '@/db/schema'
import { eq } from 'drizzle-orm'


const ChatButton = async ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  const { isValid } = await checkSubscription();

  const { userId } = await auth();

  if (!userId) return;

  const [latestChat] = await db.select()
    .from(chatsTable)
    .where(eq(chatsTable.userId, userId))
    .limit(1);

  return (
    <div className="flex mt-4">
      {isAuthenticated ? (
        <div className="flex gap-2 flex-col sm:flex-row">
          <Button asChild>
            <Link href={`/chat/${latestChat.id}`}>
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
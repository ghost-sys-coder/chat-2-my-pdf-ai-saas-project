import React from "react";
import { Button } from "@/components/ui/button";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { LogIn } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import FileUpload from "@/components/shared/FileUpload";
import ChatButton from "@/components/shared/ChatButton";
import { db } from "@/db";
import { chatsTable } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export default async function Home() {
  const { isAuthenticated, userId } = await auth();

  if (!userId) {
    throw new Error("User ID is missing");
  }

  // fetch user chats
  const [latestChat] = await db.select().from(chatsTable)
    .where(eq(chatsTable.userId, userId))
    .orderBy(desc(chatsTable.createdAt)).limit(1);


  return (
    <main className="min-h-screen bg-linear-to-r from-rose-100 to-teal-100 relative">

      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-3xl">
          <div className="flex flex-col text-center items-center">
            <div className="flex items-center justify-center gap-8">
              <h1 className="text-5xl font-semibold">Chat with any PDF</h1>
              <UserButton afterSwitchSessionUrl="/" />
            </div>

            <ChatButton isAuthenticated={isAuthenticated} chatId={latestChat.id} />
            
            <p className="mt-3 text-slate-600 max-w-xl text-lg">Join millions of students, researchers and professionals to instantly answer questions and understand research with AI</p>

            <div className="w-full mt-4">
              {isAuthenticated ? (
                <FileUpload />
              ) : (
                <SignInButton mode="modal">
                  <Button>
                    <span>Click to get Started</span>
                    <LogIn className="ml-3 w-4 h-4" />
                  </Button>
                </SignInButton>
              )}
            </div>
            <div className="w-full h-50 overflow-hidden my-4">
              <Image
                src={"/assets/chat-bot.svg"}
                alt="Chat to my pdf"
                width={100}
                height={100}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}
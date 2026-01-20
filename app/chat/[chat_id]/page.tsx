
import React, { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Chatsidebar from '@/components/shared/Chatsidebar';
import ChatComponent from '@/components/shared/ChatComponent';
import { db } from '@/db';
import { chatsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import SidebarSkeleton from '@/components/shared/SidebarSkeleton';
import PDFViewerComponent from '@/components/shared/PDFViewer';

const ChatPage = async ({ params }: { params: Promise<{ chat_id: string }> }) => {
  const { chat_id } = await params;
  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  // normalize chat_id
  const chatId = Number(chat_id);

  if (Number.isNaN(chatId)) {
    return;
  }

  // fetch chat data
  const chats = await db.select()
    .from(chatsTable)
    .where(eq(chatsTable.userId, userId));
  
  // get current chat
  const currentChat = chats.find((chat) => Number(chat.id) === chatId);


  return (
    <div className='flex h-screen w-full flex-col bg-background'>
      <header className="flex h-14 shrink-0 items-center justify-center gap-4 border-b bg-card px-4 lg:px-6">
        <h1>Chat with your PDF</h1>
      </header>
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* chat sidebar */}
        <aside className="overflow-y-auto w-72 shrink-0 hidden border-r-4 bg-muted/40 md:block lg:w-80">
          <Suspense fallback={<SidebarSkeleton />}>
            <Chatsidebar chats={chats} chatId={chatId} />
          </Suspense>
        </aside>
        {/* Main content Area - PDF Viewer + Chat Component */}
        <main className="flex min-w-0 flex-1 flex-col md:flex-row">
          <div className="min-h-0 flex-1 overflow-hidden border-b lg:border-b-0 lg:border-r lg:w-3/5 xl:w-7/12">
            <PDFViewerComponent pdfUrl={currentChat?.pdfUrl ?? ""} />
          </div>
          {/* Chat Component */}
          <div className="flex h-full min-h-0 w-full flex-col lg:w-2/5 xl:w-5/12">
            <ChatComponent chatId={chatId} />
          </div>
        </main>
      </div>
    </div>
  )
}

export default ChatPage
import React from 'react'
import { Chat } from '@/db/schema'
import Link from 'next/link';
import { Button } from '../ui/button';
import { MessageCircle, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatsidebarProps {
    chats: Chat[];
    chatId: number;
}

const Chatsidebar = ({ chatId, chats }: ChatsidebarProps) => {
    return (
        <div className='w-full h-full p-4 text-gray-200 bg-gray-900 relative flex flex-col'>
            <Button asChild className='w-full mb-4' variant={"secondary"}>
                <Link href="/">
                    <PlusCircle />
                    New Chat
                </Link>
            </Button>

            <div className="mt-4 flex-1 overflow-y-auto space-y-1 pb-16">
                {chats.length === 0 ? (
                    <div className="px-3 py-6 text-center text-sm text-gray-500">
                        No chats yet. Start by uploading a PDF
                    </div>
                ) : (
                    chats.map((chat) => {
                        const isActive = Number(chat.id) === Number(chatId);

                        console.log("Rendering chat sidebar item:", { chatId, chat_id: chat.id, isActive });

                        return (
                            <Link key={chat.id} href={String(chat.id)} className={cn("flex items-center p-2 rounded-md hover:bg-gray-800 cursor-pointer", isActive ? "bg-blue-800 text-white font-semibold" : "bg-transparent")}>
                                <MessageCircle className='h-4 w-4 mr-2' />
                                <p className='w-full overflow-hidden text-ellipsis whitespace-nowrap truncate text-sm'>{chat.pdfName}</p>
                            </Link>
                        )
                    })
                )}
            </div>

            <div className="absolute bottom-4 left-4 right-4 border-t border-gray-800 pt-4">
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-gray-500">
                    <Link href="/" className="hover:text-gray-300 transition-colors">
                        Home
                    </Link>
                    <Link href="/source" className="hover:text-gray-300 transition-colors">
                        Source
                    </Link>
                    <Link href="/pricing" className="hover:text-gray-300 transition-colors">
                        Pricing
                    </Link>
                    {/* Add Stripe / billing portal link here later */}
                    <span>© {new Date().getFullYear()} Your App</span>
                </div>
            </div>
        </div>
    )
}

export default Chatsidebar
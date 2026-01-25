"use client";
import React, { useState } from 'react'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Chat } from '@/db/schema'
import { Button } from '../ui/button';
import { CreditCard, Loader2, MessageCircle, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import axios from 'axios';
import FullscreenLoader from './FullscreenLoader';

interface ChatsidebarProps {
    chats: Chat[];
    chatId: number;
}

const Chatsidebar = ({ chatId, chats }: ChatsidebarProps) => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleStripeSubscription = async () => {
        setIsSubmitting(true);
        try {
            const { data, status } = await axios.get("/api/stripe");
            if (status === 201 || status === 200 && data.success) {
                router.push(data.url);
            }
        } catch (error) {
            console.error("Failed to connect to stripe!", error);
            toast.error((error as Error).message || "Failed to connect to stripe, try again!");
        } finally {
            setIsSubmitting(false);
        }
    }
    return (
        <>
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
                    <div className="flex flex-col w-full p-2 gap-4">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                            <Link href="/" className="hover:text-gray-300 transition-colors">
                                Home
                            </Link>
                            <Link href="/source" className="hover:text-gray-300 transition-colors">
                                Source
                            </Link>
                            <Link href="/pricing" className="hover:text-gray-300 transition-colors">
                                Pricing
                            </Link>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button
                                variant={"secondary"}
                                size={"sm"}
                                className='cursor-pointer w-full gap-2 border-violet-600/40 text-violet-300 hover:bg-violet-950/40 hover:text-violet-300'
                                onClick={handleStripeSubscription}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className='h-4 w-4 animate-spin' />
                                        Redirecting...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard />
                                        Upgrade to Pro
                                    </>
                                )}
                            </Button>
                            <span className='text-gray-600 text-xs text-center'>© {new Date().getFullYear()} Your App</span>
                        </div>
                    </div>
                </div>
            </div>

            <FullscreenLoader
                isLoading={isSubmitting}
            />
        </>
    )
}

export default Chatsidebar
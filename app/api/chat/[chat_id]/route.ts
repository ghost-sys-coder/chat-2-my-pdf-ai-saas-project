import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { messagesTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest, ctx: RouteContext<"/api/chat/[chat_id]">) {
    const { chat_id } = await ctx.params;
    const { isAuthenticated } = await auth();

    if (!isAuthenticated) {
        return NextResponse.json({
            success: false,
            message: "Not authorized, login!"
        }, { status: 401 });
    }

    if (!chat_id) {
        return NextResponse.json({
            success: false,
            message: "chat id missing!"
        }, { status: 404 });
    }

    try {
        const messages = await db.select()
            .from(messagesTable)
            .where(eq(messagesTable.chatId, parseInt(chat_id)))
            .orderBy(messagesTable.createdAt);
        return NextResponse.json({
            success: true,
            message: "Messages retrieved!",
            messages
        }, { status: 200 });
    } catch (error) {
        console.error("Failed to get messages", error);
        return NextResponse.json({
            success: false,
            message: (error as Error).message || "Failed to get messages"
        }, { status: 500 });
    }
}
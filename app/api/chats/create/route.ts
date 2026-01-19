import { NextResponse, NextRequest } from "next/server";
import { loadS3IntoPinecone } from "@/lib/pinecone";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { chatsTable } from "@/db/schema";


export async function POST(request: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({
            success: false,
            message: "Not Authorized!"
        }, { status: 401 });
    }
    
    try {
        const { file_key, file_name, file_url } = await request.json();  
        console.log({ file_key, file_name, file_url });

        // pass the file_key into pinecone
        const pages = await loadS3IntoPinecone(file_key);

        // Save to the database if needed
        const chat_id = await db.insert(chatsTable).values({
            userId: userId,
            fileKey: file_key,
            pdfName: file_name,
            pdfUrl: file_url
        }).returning({
            insertedId: chatsTable.id
        });
        
        return NextResponse.json({
            success: true,
            message: "Chat has been created!",
            pages,
            chat_id: chat_id[0].insertedId
        }, { status: 201 });
    } catch (error) {
        console.error("Failed to create chat", error);
        return NextResponse.json({
            success: false,
            message: (error as Error).message || "Something went wrong"
        }, { status: 500 });
    }
}
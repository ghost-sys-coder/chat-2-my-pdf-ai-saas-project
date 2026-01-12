import { db } from "@/db";
import { chatsTable } from "@/db/schema";
import { uploadPDFToS3 } from "@/lib/aws-s3.server";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();  

        if (!userId) {
            return NextResponse.json({
                success: false,
                message: "No authorized!"
            }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({
                success: false,
                message: "No file provided!"
            }, { status: 400})
        }

        // validate the file
        if (file.type !== "application/pdf") {
            return NextResponse.json({
                success: false,
                message: "Invalid file type. Only PDFs are allowed!"
            }, { status: 400 });
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({
                success: false,
                message: "File size cannot exceed 5MB"
            }, { status: 400 });
        }

        // Upload file to aws s3
        const { file_key, file_name, file_url } = await uploadPDFToS3(file);
        
        if (!file_url) {
            return NextResponse.json({
                success: false,
                message: "No url returned"
            }, { status: 400 });
        }


        // this code should be updated to save and start a chat for the uploaded file
        const chats = await db.insert(chatsTable).values({
            pdfName: file_name,
            fileKey: file_key,
            pdfUrl: file_url,
           userId: userId
        }).returning();

        if (!chats || chats.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Failed to save chat record! Try again"
            }, { status: 500})
        }


        return NextResponse.json({
            success: true,
            message: "File has been successfully uploaded",
            data: {
                file_key,
                file_name,
                file_url
            }
        }, { status: 201 });
    } catch (error) {
        console.error("Something went wrong!", error);
        return NextResponse.json({
            success: false,
            message: (error as Error).message || "Something went wrong!"
        }, { status: 500 });
    }
}
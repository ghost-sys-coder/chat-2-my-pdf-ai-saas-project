"use client";
import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone'
import { Inbox, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import axios from "axios";

interface FileReturnProps {
    file_key: string;
    file_name: string;
    file_url: string;
}

const FileUpload = () => {
    const router = useRouter();
    const [isFileLoading, setIsFileLoading] = useState(false);

    const { mutate, isPending } = useMutation({
        mutationFn: async ({ file_key, file_name, file_url }: FileReturnProps) => {
            const response = await axios.post("/api/chats/create", {
                file_key,
                file_name,
                file_url
            });
            return response.data
        },
        onSuccess: (data) => {
            // console.log(data);
            toast.success("Chat successfully created");

            if (data?.chat_id) {
                router.push(`/chat/${data.chat_id}`);
            }
        },
        onError: () => {
            toast.error("Failed to save chat!");
        }
    })

    const { getInputProps, getRootProps } = useDropzone({
        accept: { "application/pdf": [".pdf"] },
        maxFiles: 1,
        onDrop: async (acceptedFiles) => {
            const file = acceptedFiles[0];
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size cannot exceed 5MB");
                return;
            }

            setIsFileLoading(true);

            try {
                const formData = new FormData();
                formData.append("file", file);

                const response = await fetch("/api/s3/upload", {
                    method: "POST",
                    body: formData
                });

                const { result, message } = await response.json();
                console.log(result);

                if (!response.ok) {
                    throw new Error(message || "Upload failed");
                }

                // call the mutate function
                mutate({
                    file_key: result.file_key,
                    file_name: result.file_name,
                    file_url: result.file_url
                });

                toast.success("File successfully uploaded!");
            } catch (error) {
                console.error("Something went wrong!", error);
                toast.error((error as Error).message || "Something went wrong!");
            } finally {
                setIsFileLoading(false);
            }
        }
    });

    if (isFileLoading || isPending) {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-6 max-w-md mx-4">
                    <div className="relative">
                        <Loader2 className='h-16 w-16 text-blue-600 animate-spin' />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-10 w-10 rounded-full border-4 border-blue-200 border-t-transparent animate-spin"></div>
                        </div>
                    </div>

                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Uploading your PDF...
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Please wait while securely upload your file.
                        </p>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
                        <div className="bg-blue-600 h-2.5 rounded-full animate-pulse w-3/4"></div>
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div className='p-2 bg-white rounded-xl'>
            <div {...getRootProps({
                className: "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 justify-center items-center flex flex-col"
            })}>
                <input {...getInputProps()} />
                <>
                    <Inbox className='w-10 h-10 text-blue-500' />
                    <p className="mt-2 text-sm text-slate-400">Drop PDF Here</p>
                </>
            </div>
        </div>
    )
}

export default FileUpload
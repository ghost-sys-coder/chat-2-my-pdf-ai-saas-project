"use client";
import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Inbox, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const FileUpload = () => {
    const [isFileLoading, setIsFileLoading] = useState(false);

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

                const data = await response.json();
                console.log({ data });

                if (!response.ok) {
                    throw new Error(data.message || "Upload failed");
                }

                toast.success("File successfully uploaded!");
            } catch (error) {
                console.error("Something went wrong!", error);
                toast.error((error as Error).message || "Something went wrong!");
            } finally { 
                setIsFileLoading(false);
            }
        }
    });

    if (isFileLoading) {
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
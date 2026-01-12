"use client";
import React from 'react'
import { useDropzone } from 'react-dropzone'
import { Inbox } from 'lucide-react';
import { toast } from 'sonner';

const FileUpload = () => {
    const { getInputProps, getRootProps } = useDropzone({
        accept: { "application/pdf": [".pdf"] },
        maxFiles: 1,
        onDrop: async (acceptedFiles) => {
            const file = acceptedFiles[0];
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size cannot exceed 5MB");
                return;
            }

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
            }
        }
    });
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
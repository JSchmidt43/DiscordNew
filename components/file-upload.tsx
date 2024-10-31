"use client";

import { FileIcon, X } from "lucide-react";
import Image from "next/image";
import { UploadDropzone } from "@/lib/uploadthing";
import "@uploadthing/react/styles.css";
import React from "react";

interface FileUploadProps {
    onChange: (url?: string) => void;
    value: string;
    endpoint: "messageFile" | "serverImage";
    type?: "server" | "message";
}

const FileUpload = ({ onChange, value, endpoint, type }: FileUploadProps) => {
    // Initialize a state to hold the MIME type of the uploaded file
    const [mimeType, setMimeType] = React.useState<string | null>(null);
    const fileType = value?.split(".").pop();

    console.log("File type:", fileType);

    const handleUploadComplete = (res: any) => {
        if (res && res.length > 0) {
            const uploadedFile = res[0];
            onChange(uploadedFile.url);
            setMimeType(uploadedFile.type); // Set the MIME type based on the uploaded file
        }
    };

    if (mimeType && mimeType.startsWith("image/")) {
        // If it's an image, render the image section
        return (
            <div className="relative h-20 w-20">
                <Image
                    fill
                    src={value}
                    alt="Uploaded Image"
                    className="object-cover rounded-md" // Ensures the image covers the area nicely
                />
                <button
                    className="bg-rose-500 text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm"
                    onClick={() => {
                        onChange("");
                        setMimeType(null); // Clear MIME type on remove
                    }}
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        );
    }

    if (mimeType === "application/pdf") {
        // If it's a PDF, render the PDF section
        return (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
                <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
                <div className="ml-2 flex-grow flex flex-col"> {/* Use flex-grow to take up available space */}
                    <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-500 dark:text-indigo-400 hover:underline truncate" // Use truncate to prevent overflow
                    >
                        <p>PDF</p>
                    </a>
                    <span className="text-xs text-gray-500">PDF Document</span> {/* Additional label for clarity */}
                </div>
                <button
                    className="bg-rose-500 text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm"
                    onClick={() => {
                        onChange("");
                        setMimeType(null); // Clear MIME type on remove
                    }}
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        );
    }

    // If no file is uploaded yet, show the dropzone
    return (
        <UploadDropzone
            endpoint={endpoint}
            onClientUploadComplete={handleUploadComplete} // Use the handler
            onUploadError={(error: Error) => {
                console.log(error);
            }}
        />
    );
};

export default FileUpload;

"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

interface UploadedFile {
  name: string;
  size: number;
  status: "uploading" | "success" | "error";
  error?: string;
}

export default function TextbookUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);

  // Timer effect for processing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProcessing) {
      interval = setInterval(() => {
        setProcessingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setProcessingTime(0);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);

    const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
      name: file.name,
      size: file.size,
      status: "uploading",
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    // Upload files one by one
    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/upload-textbook", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.name === file.name ? { ...f, status: "success" } : f
            )
          );
          toast.success(`Successfully uploaded ${file.name}`);
        } else {
          throw new Error("Upload failed");
        }
      } catch (error) {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.name === file.name
              ? { ...f, status: "error", error: "Upload failed" }
              : f
          )
        );
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setIsUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/msword": [".doc"],
    },
    multiple: true,
  });

  const removeFile = (fileName: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.name !== fileName));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const triggerIngestion = async () => {
    const successfulFiles = uploadedFiles.filter((f) => f.status === "success");
    if (successfulFiles.length === 0) {
      toast.error("No successfully uploaded files to process");
      return;
    }

    setIsProcessing(true);
    setProcessingTime(0);

    try {
      const response = await fetch("/api/ingest-textbooks", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Document processing started successfully!");
        // Keep processing state active for a few seconds to show the timer
        setTimeout(() => {
          setIsProcessing(false);
        }, 3000);
      } else {
        toast.error("Failed to start processing");
        setIsProcessing(false);
      }
    } catch (error) {
      toast.error("Error starting document processing");
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-2">
          Upload Documents
        </h2>
        <p className="text-gray-300 font-medium">
          Upload PDF, DOC, DOCX, or TXT files to create a searchable knowledge
          base for AI-powered question answering.
        </p>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 mb-6 backdrop-blur-md ${
          isDragActive
            ? "border-gray-400/70 bg-gray-500/10 shadow-lg"
            : "border-gray-600/50 hover:border-gray-500/70 bg-black/20 hover:bg-black/30"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        {isDragActive ? (
          <p className="text-gray-300 text-lg">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-gray-300 text-lg mb-2">
              Drag & drop document files here, or click to select
            </p>
            <p className="text-gray-400 text-sm">
              Supports PDF, DOC, DOCX, and TXT files
            </p>
          </div>
        )}
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <h3 className="text-lg font-medium text-white mb-4">
            Uploaded Files
          </h3>
          <div className="space-y-3">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-800/60 backdrop-blur-md rounded-lg border border-gray-700/50"
              >
                <div className="flex items-center space-x-3">
                  <File className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {file.status === "uploading" && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  )}
                  {file.status === "success" && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {file.status === "error" && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <button
                    onClick={() => removeFile(file.name)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Process Button */}
      {uploadedFiles.some((f) => f.status === "success") && (
        <div className="mt-6 pt-4 border-t border-gray-700/50">
          <button
            onClick={triggerIngestion}
            disabled={isUploading || isProcessing}
            className="w-full bg-gray-700/80 text-white py-2 px-4 rounded-lg hover:bg-gray-600/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 border border-gray-600/50 flex items-center justify-center space-x-2 backdrop-blur-md"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing Documents...</span>
                <span className="text-sm opacity-75">
                  ({formatTime(processingTime)})
                </span>
              </>
            ) : isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              "Process Documents for AI Questions"
            )}
          </button>
          <p className="text-sm text-gray-400 mt-2">
            This will create embeddings from the uploaded documents to enable
            AI-powered question answering.
          </p>
        </div>
      )}
    </div>
  );
}

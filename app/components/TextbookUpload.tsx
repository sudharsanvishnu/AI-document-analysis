"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";
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

    try {
      const response = await fetch("/api/ingest-textbooks", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Document processing started successfully!");
      } else {
        toast.error("Failed to start processing");
      }
    } catch (error) {
      toast.error("Error starting document processing");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Upload Documents
        </h2>
        <p className="text-gray-600 mb-6">
          Upload PDF, DOC, DOCX, or TXT files to create a searchable knowledge
          base for AI-powered question answering.
        </p>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-primary-500 bg-primary-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          {isDragActive ? (
            <p className="text-primary-600 text-lg">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-gray-600 text-lg mb-2">
                Drag & drop document files here, or click to select
              </p>
              <p className="text-gray-500 text-sm">
                Supports PDF, DOC, DOCX, and TXT files
              </p>
            </div>
          )}
        </div>

        {/* File List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Uploaded Files
            </h3>
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <File className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {file.status === "uploading" && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500" />
                    )}
                    {file.status === "success" && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {file.status === "error" && (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    <button
                      onClick={() => removeFile(file.name)}
                      className="text-gray-400 hover:text-red-500"
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
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={triggerIngestion}
              disabled={isUploading}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading
                ? "Processing..."
                : "Process Documents for AI Questions"}
            </button>
            <p className="text-sm text-gray-500 mt-2">
              This will create embeddings from the uploaded documents to enable
              AI-powered question answering.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

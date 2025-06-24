"use client";

import { useState } from "react";
import { BookOpen, MessageSquare, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import TextbookUpload from "./components/TextbookUpload";
import QuestionAnswering from "./components/QuestionAnswering";

type Tab = "upload" | "chat";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("upload");

  const tabs = [
    { id: "upload" as Tab, label: "Upload Documents", icon: BookOpen },
    { id: "chat" as Tab, label: "Ask Questions", icon: MessageSquare },
  ];

  const clearAllData = async () => {
    if (
      !confirm(
        "⚠️ WARNING: This will permanently delete ALL documents, processed chunks, and embeddings.\n\n" +
          "You will need to re-upload and re-process documents to use the system again.\n\n" +
          "Are you absolutely sure you want to continue?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/clear-textbooks", {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("All documents and processed data cleared successfully!");
      } else {
        toast.error("Failed to clear documents and data");
      }
    } catch (error) {
      toast.error("Error clearing documents and data");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  AI Document Assistant
                </h1>
                <p className="text-gray-600 mt-2">
                  Upload PDF documents and ask questions to get AI-powered
                  answers based on the content
                </p>
              </div>
              <button
                onClick={clearAllData}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All Data</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-white rounded-t-lg">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-primary-500 text-primary-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-b-lg shadow-sm">
            {activeTab === "upload" && (
              <div className="p-6">
                <TextbookUpload />
              </div>
            )}
            {activeTab === "chat" && (
              <div className="p-6">
                <QuestionAnswering />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

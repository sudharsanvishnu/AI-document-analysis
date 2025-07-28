"use client";

import { useState } from "react";
import { BookOpen, MessageSquare, Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import TextbookUpload from "./components/TextbookUpload";
import QuestionAnswering from "./components/QuestionAnswering";

type Tab = "upload" | "chat";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");

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
    <div className="flex h-screen bg-black relative overflow-hidden">
      {/* Ambient Gradient Background */}
      <div className="absolute inset-0">
        {/* Primary gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-pink-900/30 animate-pulse-slow"></div>

        {/* Secondary gradient */}
        <div
          className="absolute inset-0 bg-gradient-to-tl from-cyan-900/20 via-indigo-900/15 to-violet-900/20 animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* Accent gradient */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-emerald-900/15 via-teal-900/10 to-blue-900/15 animate-pulse-slow"
          style={{ animationDelay: "4s" }}
        ></div>

        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-black/90"></div>

        {/* Floating ambient elements */}
        <div className="absolute top-20 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-float"></div>
        <div
          className="absolute bottom-40 right-1/3 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/3 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl animate-float"
          style={{ animationDelay: "3s" }}
        ></div>
      </div>

      {/* Sidebar */}
      <div className="w-64 bg-black/90 backdrop-blur-md border-r border-gray-700/50 flex flex-col relative z-10">
        {/* Logo/Brand */}
        <div className="p-4 border-b border-gray-700/50">
          <h1 className="text-2xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            AI Document
          </h1>
          <h2 className="text-xl font-bold text-white tracking-wide">
            Assistant
          </h2>
          <p className="text-xs text-gray-400 mt-2 font-medium">
            Upload PDFs and ask questions
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-gray-800/90 text-white shadow-lg backdrop-blur-md border border-gray-600/50"
                    : "text-gray-300 hover:bg-gray-800/60 hover:text-white backdrop-blur-md hover:border hover:border-gray-600/30"
                }`}
              >
                <Icon className="w-4 h-4 mr-3" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-700/50">
          <button
            onClick={clearAllData}
            className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-all duration-300 backdrop-blur-md hover:border hover:border-red-500/30"
          >
            <Trash2 className="w-4 h-4 mr-3" />
            Clear All Data
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {activeTab === "chat" && <QuestionAnswering />}
          {activeTab === "upload" && <TextbookUpload />}
        </div>
      </div>
    </div>
  );
}

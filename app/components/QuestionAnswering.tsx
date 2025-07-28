"use client";

import { useState } from "react";
import { Send, MessageCircle, Bot, User, Loader } from "lucide-react";
import toast from "react-hot-toast";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

export default function QuestionAnswering() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: currentQuestion.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentQuestion("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ask-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: userMessage.content }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: data.answer,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to get answer");
      }
    } catch (error) {
      toast.error("Error asking question");
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Ask Questions
          </h2>
          <p className="text-gray-300 mt-1 font-medium">
            Upload PDFs first, then ask questions and get AI-powered answers
            based on the content.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="text-gray-400 hover:text-gray-200 px-3 py-1 rounded-md border border-gray-600/50 hover:border-gray-500/70 transition-all duration-300 backdrop-blur-md hover:bg-gray-800/30"
          >
            Clear Chat
          </button>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 bg-black/40 backdrop-blur-md border border-gray-700/50 rounded-lg p-4 mb-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageCircle className="w-12 h-12 mb-4 text-gray-400" />
            <p className="text-lg font-medium">Start a conversation!</p>
            <p className="text-sm">
              Ask questions about your uploaded documents.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start space-x-3 max-w-[80%] ${
                    message.type === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md ${
                      message.type === "user"
                        ? "bg-gray-700/90 text-white border border-gray-600/50"
                        : "bg-gray-700/80 text-gray-300 border border-gray-600/50"
                    }`}
                  >
                    {message.type === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={`px-4 py-3 rounded-lg backdrop-blur-md ${
                      message.type === "user"
                        ? "bg-gray-700/90 text-white border border-gray-600/50"
                        : "bg-gray-900/80 border border-gray-600/50"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-2 ${
                        message.type === "user"
                          ? "text-gray-300"
                          : "text-gray-400"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3 max-w-[80%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700/80 text-gray-300 flex items-center justify-center backdrop-blur-md border border-gray-600/50">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="px-4 py-3 rounded-lg bg-gray-900/80 border border-gray-600/50 backdrop-blur-md">
                    <div className="flex items-center space-x-2">
                      <Loader className="w-4 h-4 animate-spin text-gray-400" />
                      <p className="text-sm text-gray-400">Thinking...</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Question Input */}
      <form onSubmit={handleSubmit} className="flex space-x-4">
        <div className="flex-1">
          <textarea
            value={currentQuestion}
            onChange={(e) => setCurrentQuestion(e.target.value)}
            placeholder="Ask a question about your uploaded documents..."
            className="w-full px-4 py-3 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-gray-500/50 focus:border-transparent resize-none bg-black/40 text-white backdrop-blur-md transition-all duration-300"
            rows={3}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <p className="text-xs text-gray-400 mt-1">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
        <button
          type="submit"
          disabled={!currentQuestion.trim() || isLoading}
          className="px-6 py-3 bg-gray-700/80 text-white rounded-lg hover:bg-gray-600/80 focus:ring-2 focus:ring-gray-500/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2 backdrop-blur-md border border-gray-600/50"
        >
          <Send className="w-4 h-4" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}

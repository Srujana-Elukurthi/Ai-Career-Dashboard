import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, Send, ArrowLeft, User, Bot, Sparkles } from "lucide-react";
import { QUESTION_BANK, evaluateAnswer, generateFollowUp } from "../utils/interviewLogic";

interface MockInterviewChatProps {
  onNavigate: (page: string) => void;
  profileData: any;
}

interface Message {
  id: string;
  sender: "user" | "ai";
  content: string;
  timestamp: Date;
}

export function MockInterviewChat({ onNavigate, profileData }: MockInterviewChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      content: `Hello ${profileData.name}! I'm your AI interview coach. I can help you practice for technical interviews, behavioral questions, and HR rounds. What would you like to practice today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<"menu" | "interview" | "feedback">("menu");
  const [category, setCategory] = useState<string | null>(null);
  const [askedQuestions, setAskedQuestions] = useState<Set<string>>(new Set());
  const [isFollowUp, setIsFollowUp] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = useCallback(async (overrideInput?: string) => {
    if (loading) return;

    const textToSend = overrideInput || input;
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!overrideInput) setInput("");
    setLoading(true);

    try {
      // 0. Menu Stage Selection
      if (stage === "menu") {
        const lowerInput = textToSend.toLowerCase();
        let match = null;
        if (lowerInput.includes("technical") || lowerInput.includes("tech")) match = "technical";
        else if (lowerInput.includes("behavioral") || lowerInput.includes("behavior")) match = "behavioral";
        else if (lowerInput.includes("hr") || lowerInput.includes("human")) match = "hr";
        else if (lowerInput.includes("coding")) match = "coding";

        if (match) {
          setCategory(match);
          setStage("interview");

          const available = QUESTION_BANK[match].filter(q => !askedQuestions.has(q.q));
          const selected = available.length > 0 ? available[Math.floor(Math.random() * available.length)].q : QUESTION_BANK[match][0].q;

          setAskedQuestions(prev => new Set(prev).add(selected));

          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: "ai",
            content: `Great! Let's do a ${match} question:\n\n${selected}`,
            timestamp: new Date()
          }]);
          setLoading(false);
        } else {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: "ai",
            content: "Please select a valid category: Technical, Behavioral, HR, or Coding.",
            timestamp: new Date()
          }]);
          setLoading(false);
        }
        return;
      }

      // 1. Interview Stage Answer Evaluation
      if (category) {
        const result = evaluateAnswer(textToSend, category);

        let aiResponse = "";
        aiResponse += `**Feedback (${result.rating}/10):** ${result.feedback}\n\n`;
        if (result.strengths.length > 0) aiResponse += `✅ **Strengths:** ${result.strengths.join(" ")}\n`;
        if (result.improvements.length > 0) aiResponse += `💡 **Improvements:** ${result.improvements.join(" ")}\n`;

        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: "ai",
          content: aiResponse,
          timestamp: new Date()
        }]);

        // Optional Follow up logic chaining
        if (!isFollowUp && result.rating >= 7) {
          const followUpQ = generateFollowUp(textToSend, category);
          setIsFollowUp(true);
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            sender: "ai",
            content: followUpQ,
            timestamp: new Date()
          }]);
        } else {
          setIsFollowUp(false);
          setStage("menu");
          setCategory(null);
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            sender: "ai",
            content: "Would you like to try another question? Just tell me the category (Technical, Behavioral, HR, Coding).",
            timestamp: new Date()
          }]);
        }
        setLoading(false);
      }

    } catch (error) {
      console.error("Local Engine Error:", error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "ai",
          content: "Oops! An error occurred analyzing your answer.",
          timestamp: new Date()
        }
      ]);
      setLoading(false);
    }
  }, [input, loading, stage, category, askedQuestions, isFollowUp]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const quickPrompts = [
    "Technical questions",
    "Behavioral questions",
    "HR questions",
    "Coding problems"
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate("dashboard")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-blue-600" />
              <span className="font-semibold text-xl">AI Mock Interview</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered</span>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-6 flex flex-col">
        {/* Messages */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === "ai"
                    ? "bg-blue-100"
                    : "bg-gray-200"
                    }`}
                >
                  {message.sender === "ai" ? (
                    <Bot className="w-5 h-5 text-blue-600" />
                  ) : (
                    <User className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${message.sender === "ai"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-blue-600 text-white"
                    }`}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                  <div
                    className={`text-xs mt-1 ${message.sender === "ai" ? "text-gray-500" : "text-blue-100"
                      }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-500 italic">
                  AI is typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 2 && (
            <div className="px-6 pb-4">
              <div className="text-sm text-gray-600 mb-2">Quick start:</div>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      handleSend(prompt);
                    }}
                    disabled={loading}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                placeholder="Type your message or answer..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

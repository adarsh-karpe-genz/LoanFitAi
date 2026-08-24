'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ChatMessage,
  RecommendationResultItem,
  SupportedLanguage,
} from '@/types/database';
import { SUPPORTED_LANGUAGES } from '@/lib/services/xaiEngine';
import {
  MessageSquare,
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Globe,
  HelpCircle,
  ShieldCheck,
  RotateCcw,
  Zap,
} from 'lucide-react';

interface AiAdvisorSidebarProps {
  recommendations: RecommendationResultItem[];
  borrowerContext: {
    loanType: string;
    loanAmount: number;
    tenureMonths: number;
    monthlyIncome: number;
    existingEMI: number;
    creditScore: number | null;
    foirThreshold: number;
  };
  isOpen: boolean;
  onToggle: () => void;
}

const INITIAL_SUGGESTIONS = [
  'Why did Rank #1 score the highest?',
  'How does my FOIR affect my loan approval?',
  'What is the difference between Rank #1 and Rank #2?',
  'What happens if I increase my loan tenure by 5 years?',
];

export default function AiAdvisorSidebar({
  recommendations,
  borrowerContext,
  isOpen,
  onToggle,
}: AiAdvisorSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Hello! I'm your **LoanFit AI Advisor**, powered by Gemini. I can explain why specific loans scored higher, analyze your FOIR affordability, or explain cost trade-offs. How can I help you?`,
      timestamp: new Date().toISOString(),
      isGrounded: true,
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (text?: string) => {
    const messageContent = (text || inputPrompt).trim();
    if (!messageContent || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString(),
      language,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputPrompt('');
    setLoading(true);

    try {
      const response = await fetch('/api/v1/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          recommendations,
          borrowerContext,
          language,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.message) {
          setMessages((prev) => [...prev, data.message]);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: 'Sorry, I had trouble processing that question. Please try asking again.',
            timestamp: new Date().toISOString(),
            isGrounded: false,
          },
        ]);
      }
    } catch (err) {
      console.error('Chatbot request error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Chat history reset. Ask me any question about your **${borrowerContext.loanType}** options!`,
        timestamp: new Date().toISOString(),
        isGrounded: true,
      },
    ]);
  };

  return (
    <>
      {/* Floating Toggle Button (visible when sidebar is closed) */}
      {!isOpen && (
        <button
          type="button"
          onClick={onToggle}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-2xl hover:shadow-blue-500/20 border border-slate-700 transition-all hover:scale-105 group"
          aria-label="Open AI Advisor"
        >
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
          </div>
          <span className="text-xs font-bold font-display">Ask LoanFit AI</span>
        </button>
      )}

      {/* Slide-in Persistent Sidebar */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-blue-200" />
              </div>
              <div>
                <h3 className="text-xs font-display font-bold text-white flex items-center gap-1.5">
                  <span>LoanFit AI Advisor</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-500/30 text-blue-300 border border-blue-400/30">
                    Gemini Flash
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">
                  Grounded in Verified Rates & Phase 3 Math
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearChat}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Reset conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onToggle}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Close AI Sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Multilingual Selector Bar */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>Language:</span>
            </span>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          {/* Message Thread */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto text-xs bg-slate-50/50">
            {messages.map((m) => {
              const isAssistant = m.role === 'assistant';
              return (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${isAssistant ? 'items-start' : 'items-end justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Bot className="w-4 h-4 text-blue-400" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 space-y-1.5 leading-relaxed ${
                      isAssistant
                        ? 'bg-white border border-slate-200/90 text-slate-800 shadow-sm'
                        : 'bg-blue-600 text-white shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-line prose-xs">
                      {m.content}
                    </div>
                    <div
                      className={`text-[9px] ${
                        isAssistant ? 'text-slate-400' : 'text-blue-200 text-right'
                      }`}
                    >
                      {new Date(m.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  {!isAssistant && (
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 mb-0.5 font-bold text-[10px]">
                      You
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 w-24">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Bar */}
          <div className="p-3 bg-white border-t border-slate-100 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Suggested Questions:
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
              {INITIAL_SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(s)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-200 transition-all text-left truncate max-w-full"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Input Footer */}
          <div className="p-3.5 bg-white border-t border-slate-200">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about rates, FOIR, or bank trade-offs..."
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputPrompt.trim() || loading}
                className="absolute right-1.5 p-2 rounded-full bg-slate-900 hover:bg-blue-600 text-white disabled:opacity-40 transition-colors"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-1.5">
              Grounded in deterministic math. Always verify terms before bank application.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

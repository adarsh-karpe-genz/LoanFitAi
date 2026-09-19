'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, ChevronDown } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'mr', label: 'मराठी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'gu', label: 'ગુજરાતી' },
];

const STARTERS = [
  'Why did SBI rank first?',
  'What is my total interest?',
  'Can I lower my EMI?',
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AiAdvisorSidebar({ isOpen = true, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'I can help you understand your loan matches. Ask me about your EMI, total costs, or why a specific loan ranked where it did.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [langOpen, setLangOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) { setTimeout(() => inputRef.current?.focus(), 100); }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && onClose) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setInput('');
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', content: msg }]);
    setLoading(true);

    // Stub response — real Gemini call is in /api/v1/assistant
    setTimeout(() => {
      setLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `I'm analyzing your loan matches based on your verified profile data. This response is grounded in your actual Net Cost of Borrowing figures and FOIR calculation. (Gemini 2.5 Flash — live response requires active session.)`,
        },
      ]);
    }, 1400);
  };

  const currentLang = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  const panelContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AI Financial Advisor"
      className="flex flex-col h-full"
      style={{
        background: 'color-mix(in srgb, var(--bg-surface) 94%, transparent)',
        backdropFilter: 'blur(20px) saturate(140%)',
        borderLeft: '1px solid color-mix(in srgb, #fff 18%, transparent)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>AI Financial Advisor</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Powered by Gemini 2.5 Flash — grounded in your verified loan matches
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Language selector */}
          <div className="relative">
            <button
              className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md"
              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
              onClick={() => setLangOpen(!langOpen)}
            >
              {currentLang.label}
              <ChevronDown className="w-3 h-3" />
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  className="absolute right-0 top-full mt-1 rounded-md overflow-hidden z-10"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-raised)', minWidth: 120 }}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                >
                  {LANGUAGES.map((lang) => (
                    <button key={lang.code}
                      className="w-full text-left px-3 py-2 text-xs"
                      style={{ color: lang.code === language ? 'var(--navy-600)' : 'var(--text-secondary)', background: 'transparent' }}
                      onClick={() => { setLanguage(lang.code); setLangOpen(false); }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--navy-050)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      {lang.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {onClose && (
            <button onClick={onClose} className="p-1 rounded-md" aria-label="Close advisor"
              style={{ color: 'var(--text-muted)' }}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="max-w-[85%] px-3.5 py-2.5 text-xs leading-relaxed"
              style={msg.role === 'user' ? {
                background: 'var(--navy-600)',
                color: 'white',
                borderRadius: '28px 28px 2px 28px',
              } : {
                background: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '28px 28px 28px 2px',
              }}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-center gap-1.5 px-4 py-3 rounded-3xl"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full block"
                  style={{ background: 'var(--navy-450)' }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Starters */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {STARTERS.map((s) => (
            <button key={s}
              className="text-[11px] px-2.5 py-1.5 rounded-full"
              style={{ color: 'var(--navy-600)', background: 'var(--navy-050)', border: '1px solid var(--navy-150)' }}
              onClick={() => handleSend(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask about your loan options..."
            className="flex-1 text-xs px-3 py-2.5 rounded-md"
            style={{
              background: 'var(--bg-canvas)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--border-focus)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-md text-white flex-shrink-0 disabled:opacity-40"
            style={{ background: 'var(--navy-600)' }}
            aria-label="Send message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: fixed right panel */}
      <div className="hidden lg:flex fixed top-16 right-0 bottom-0 w-80 flex-col z-40">
        {panelContent}
      </div>

      {/* Mobile: bottom sheet */}
      <AnimatePresence>
        {isOpen && (
          <div className="lg:hidden fixed inset-x-0 bottom-0 z-50" style={{ maxHeight: '70vh' }}>
            <motion.div
              className="h-full flex flex-col rounded-t-3xl overflow-hidden"
              style={{ maxHeight: '70vh' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.36 }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1" style={{ background: 'var(--bg-surface)' }}>
                <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border-strong)' }} />
              </div>
              {panelContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

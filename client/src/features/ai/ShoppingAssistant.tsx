import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Trash2,
  Minimize2,
  Bot,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAskShoppingAssistantMutation } from '../../store/api/aiApi';
import { ChatMessage, ChatMessageData } from './components/ChatMessage';
import { SupportedLanguage } from '@shopnest/shared';

export const ShoppingAssistant: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [lastQuery, setLastQuery] = useState<string>('');

  const [askAssistant, { isLoading }] = useAskShoppingAssistantMutation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isAmharic = i18n.language?.startsWith('am');
  const currentLang: SupportedLanguage = isAmharic ? 'am' : 'en';

  // Seed initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-msg',
          role: 'assistant',
          content: t(
            'aiAssistant.welcomeMessage',
            'Hello! I am your ShopNest shopping assistant. How can I help you discover Ethiopian products today?'
          ),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [t, messages.length]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (isOpen && typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const rawText = textToSend !== undefined ? textToSend : inputMessage;
    const cleanText = rawText.trim();
    if (!cleanText || isLoading) return;

    setLastQuery(cleanText);
    setInputMessage('');

    // Append user message
    const userMsg: ChatMessageData = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: cleanText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      // Build conversation history (excluding error messages)
      const conversationHistory = messages
        .filter((m) => !m.isError)
        .slice(-6)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await askAssistant({
        message: cleanText,
        language: currentLang,
        conversationHistory,
      }).unwrap();

      if (res.success && res.data) {
        const assistantMsg: ChatMessageData = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: res.data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          products: res.data.products,
          isMock: res.data.isMock,
          relaxedCriteria: res.data.relaxedCriteria,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error('Unsuccessful API response');
      }
    } catch (err: any) {
      const errorText =
        err?.data?.message ||
        t(
          'aiAssistant.errorMessage',
          'Unable to process your request at this time. Please check your connection and retry.'
        );

      const errorMsg: ChatMessageData = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: errorText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
        canRetry: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleRetry = () => {
    if (lastQuery) {
      handleSendMessage(lastQuery);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: t(
          'aiAssistant.welcomeMessage',
          'Hello! I am your ShopNest shopping assistant. How can I help you discover Ethiopian products today?'
        ),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const suggestedQuestions: string[] = t('aiAssistant.suggestedQuestions', {
    returnObjects: true,
    defaultValue: [
      'Find a laptop under 40,000 ETB',
      'Show me available phones below 15,000 birr',
      'Which products are suitable for a university student?',
      'Authentic Ethiopian coffee and traditional sets',
    ],
  }) as string[];

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label={t('aiAssistant.fabLabel', 'ShopNest AI Assistant')}
          title={t('aiAssistant.fabTooltip', 'Ask ShopNest AI')}
          className="relative flex items-center justify-center w-13 h-13 rounded-full bg-gradient-to-tr from-[#EA580C] to-[#F97316] text-white shadow-lg hover:shadow-orange-500/25 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-hidden focus:ring-4 focus:ring-orange-300 dark:focus:ring-orange-950 cursor-pointer"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <Sparkles className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500" />
              </span>
            </>
          )}
        </button>
      </div>

      {/* Floating Chat Modal Panel */}
      {isOpen && (
        <section
          role="dialog"
          aria-label={t('aiAssistant.title', 'ShopNest AI Shopping Assistant')}
          className="fixed bottom-24 md:bottom-20 right-2 sm:right-6 z-50 w-[calc(100vw-1rem)] sm:w-[420px] max-w-[430px] h-[580px] max-h-[calc(100vh-7.5rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <header className="px-4 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white flex items-center justify-between shadow-xs shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold leading-tight">
                  {t('aiAssistant.title', 'ShopNest AI Assistant')}
                </h2>
                <p className="text-[11px] text-white/90 leading-tight">
                  {t('aiAssistant.slogan', 'Your Marketplace, Your Way.')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearChat}
                title={t('aiAssistant.clearChat', 'Clear conversation')}
                aria-label={t('aiAssistant.clearChat', 'Clear conversation')}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title={t('aiAssistant.minimize', 'Minimize assistant')}
                aria-label={t('aiAssistant.minimize', 'Minimize assistant')}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-[#F9FAFB] dark:bg-gray-950/60">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onRetry={handleRetry}
                onProductClick={() => {
                  // Keep open or let user navigate smoothly
                }}
              />
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 my-2 text-xs text-orange-600 dark:text-orange-400 p-2.5 bg-orange-50 dark:bg-orange-950/40 rounded-xl border border-orange-100 dark:border-orange-900/30">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span className="font-medium animate-pulse">
                  {t('aiAssistant.thinking', 'Consulting genuine catalog...')}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions Pills (shown if fewer than 3 user messages) */}
          {messages.filter((m) => m.role === 'user').length < 2 && (
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900/80 border-t border-gray-100 dark:border-gray-800 shrink-0">
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-orange-500" />
                <span>{t('aiAssistant.suggestedTitle', 'Try asking:')}</span>
              </p>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSendMessage(q)}
                    className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-orange-400 dark:hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <footer className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2"
            >
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value.slice(0, 500))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={2}
                  maxLength={500}
                  placeholder={t(
                    'aiAssistant.inputPlaceholder',
                    'Ask: "Find a laptop under 40,000 ETB" or "Show phones below 15,000 birr"...'
                  )}
                  disabled={isLoading}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 resize-none disabled:opacity-50"
                />
                <span className="absolute bottom-1 right-2 text-[9px] text-gray-400">
                  {inputMessage.length}/500
                </span>
              </div>

              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                aria-label={t('aiAssistant.send', 'Send')}
                className="p-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-40 disabled:hover:bg-orange-600 text-white shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </footer>
        </section>
      )}
    </>
  );
};

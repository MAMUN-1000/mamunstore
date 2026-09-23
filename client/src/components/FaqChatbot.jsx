import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  X,
  Send,
  HelpCircle,
  ExternalLink,
  Bot,
  User,
  Sparkles,
  ArrowRight,
  Headphones,
} from 'lucide-react';
import { matchFaqQuery, SUPPORT_CONFIG } from '../data/helpKnowledgeBase';

const QUICK_PROMPTS = [
  'How do I place an order?',
  'What payment methods are supported?',
  'How does Cash on Delivery work?',
  'Do you deliver to JU Savar?',
  'Who can leave product reviews?',
];

export const FaqChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Hello! I'm the ${SUPPORT_CONFIG.storeName} FAQ Assistant. I can help answer questions about our orders, payments (bKash/Nagad/COD), delivery to JU & Savar, account access, and verified reviews. What would you like to know?`,
      timestamp: new Date(),
      actionLink: null,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  /**
   * Pluggable Query Assistant
   * Currently searches verified local knowledge base.
   * Can be swapped with an async API endpoint in the future without changing the UI.
   */
  const handleAskQuestion = (questionText) => {
    const text = questionText.trim();
    if (!text) return;

    // 1. Append user's question
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate natural micro-delay for realistic feel
    setTimeout(() => {
      const matchResult = matchFaqQuery(text);

      let botMsg;
      if (matchResult) {
        botMsg = {
          id: Date.now() + 1,
          sender: 'bot',
          text: matchResult.entry.answer,
          actionLink: matchResult.entry.actionLink || null,
          category: matchResult.entry.category,
          timestamp: new Date(),
        };
      } else {
        // Safe fallback directing to Customer Care
        botMsg = {
          id: Date.now() + 1,
          sender: 'bot',
          text: "I couldn't find a verified answer to that question in our knowledge base. To ensure you receive accurate assistance, please check our comprehensive Help Center or contact Customer Care directly.",
          actionLink: { text: 'Open Customer Care', url: '/customer-care' },
          isFallback: true,
          timestamp: new Date(),
        };
      }

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 400);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAskQuestion(input);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-full shadow-lg hover:shadow-emerald-600/30 transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
          title="Ask Store FAQ Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-emerald-600 rounded-full animate-pulse" />
          </div>
          <span className="text-xs font-bold tracking-wide pr-1 hidden sm:inline">
            Need Help? Ask FAQ Bot
          </span>
        </button>
      )}

      {/* Expanded Chatbot Modal / Panel */}
      {isOpen && (
        <div className="w-[92vw] sm:w-96 h-[540px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs text-white">Store Help Assistant</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[10px] text-slate-400">
                  Verified FAQ Knowledge Base
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Close Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Transcript Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-slate-50/60 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex-shrink-0 flex items-center justify-center mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Contextual Action Link */}
                  {msg.actionLink && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <Link
                        to={msg.actionLink.url}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md transition"
                      >
                        <span>{msg.actionLink.text}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}

                  {msg.isFallback && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                      <Link
                        to="/help"
                        onClick={() => setIsOpen(false)}
                        className="text-[11px] font-semibold text-slate-700 hover:bg-slate-100 px-2 py-1 rounded border border-slate-200 transition"
                      >
                        Help Center
                      </Link>
                      <Link
                        to="/customer-care"
                        onClick={() => setIsOpen(false)}
                        className="text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded border border-emerald-200 transition"
                      >
                        Contact Care
                      </Link>
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex-shrink-0 flex items-center justify-center mt-0.5 text-[11px] font-bold">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 items-center">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex-shrink-0 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl px-3.5 py-2 flex items-center gap-1.5 text-slate-400 text-xs shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[10px] pl-1 font-medium">Checking knowledge base...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 overflow-x-auto scrollbar-none flex gap-1.5">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleAskQuestion(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-[11px] font-medium transition cursor-pointer flex-shrink-0 border border-slate-200/60"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSubmit}
            className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about orders, bKash, delivery..."
              className="flex-1 text-xs px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Micro Footer Notice */}
          <div className="bg-slate-100 px-3 py-1 text-center text-[10px] text-slate-500 border-t border-slate-200">
            Answers are restricted strictly to verified store policies.
          </div>
        </div>
      )}
    </div>
  );
};

export default FaqChatbot;

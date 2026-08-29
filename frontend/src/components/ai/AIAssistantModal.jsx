import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/api';
import {
  Sparkles,
  Bot,
  Send,
  X,
  ChevronDown,
  ExternalLink,
  Zap,
  Cpu,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AIAssistantModal = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeModel, setActiveModel] = useState('Multi-Model Orchestrator');
  const messagesEndRef = useRef(null);

  const role = user?.role || 'student';

  useEffect(() => {
    if (messages.length === 0 && user) {
      const initialGreeting =
        role === 'student'
          ? `Hello ${user.full_name?.split(' ')[0] || 'there'}! I'm your SkillBridge AI Career & Skill Advisor. I can analyze your verified skills, guide your internship search, or optimize your resume.`
          : role === 'academician'
          ? `Greetings Professor ${user.full_name?.split(' ')[0] || ''}. I'm your AI Academic Intelligence Assistant. I can analyze department skill gaps and propose industry collaboration initiatives.`
          : `Hello ${user.full_name?.split(' ')[0] || 'Recruiter'}. I'm your AI Recruitment Assistant. I can help you evaluate candidate compatibility and synthesize skill gap diagnostics.`;

      setMessages([
        {
          id: 'init-1',
          sender: 'assistant',
          text: initialGreeting,
          model: 'gemini-1.5-flash + llama-3.3-70b-versatile (Groq)',
          quickSuggestions:
            role === 'student'
              ? ['Analyze my skill gaps', 'What career paths match my skills?', 'How to improve my ATS resume?']
              : role === 'academician'
              ? ['Cohort Skill Gap Insights', 'Curriculum Industry Alignment', 'Propose FDP Workshop']
              : ['Run AI Candidate Matching', 'Recruitment Pipeline Analytics', 'Post New Opening'],
          links: [],
        },
      ]);
    }
  }, [user, role, messages.length]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend = null) => {
    const query = textToSend || inputMsg;
    if (!query.trim() || loading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputMsg('');
    setLoading(true);

    try {
      const response = await apiService.chatWithAIAssistant(query);
      const aiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        model: response.ai_meta?.model_used || 'gemini-1.5-flash',
        quickSuggestions: response.quick_suggestions || [],
        links: response.relevant_links || [],
      };
      setMessages((prev) => [...prev, aiMessage]);
      setActiveModel(response.ai_meta?.model_used || 'Multi-Model Engine');
    } catch (err) {
      console.error('AI chat error:', err);
      const errorMsg = {
        id: `ai-err-${Date.now()}`,
        sender: 'assistant',
        text: 'SkillBridge AI is currently operating in offline-resilient mode. Please try asking about career paths, resume optimization, or candidate matching!',
        model: 'Simulation Fallback',
        quickSuggestions: [],
        links: [],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 1. Floating AI Assistant Launcher Button */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="relative">
              <Bot className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <span className="text-xs font-bold tracking-wide">SkillBridge AI</span>
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          </button>
        )}
      </div>

      {/* 2. Floating AI Assistant Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col h-[560px] overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-primary-700 via-primary-600 to-indigo-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white/10 rounded-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold leading-none">SkillBridge AI Agent</h3>
                  <span className="text-[9px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-1.5 py-0.5 rounded font-mono font-medium">
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-primary-100/80 mt-0.5 flex items-center gap-1">
                  <Cpu className="w-3 h-3" /> Gemini 1.5 + Groq (Llama 3.3)
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Model Status Bar */}
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" /> Active Engine: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{activeModel}</strong>
            </span>
            <span className="capitalize font-mono text-[9px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
              Role: {role}
            </span>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/20">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-primary-600 text-white rounded-br-none shadow-sm'
                      : 'bg-white dark:bg-slate-700/80 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-600/80 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Links attached */}
                  {msg.links && msg.links.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-600/60 flex flex-wrap gap-1.5">
                      {msg.links.map((link, idx) => (
                        <Link
                          key={idx}
                          to={link.url}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:underline rounded text-[10px] font-semibold"
                        >
                          {link.label} <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick suggestions chips under assistant messages */}
                {msg.quickSuggestions && msg.quickSuggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2 max-w-[90%]">
                    {msg.quickSuggestions.map((sugg, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(sugg)}
                        className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-primary-300 text-slate-700 dark:text-slate-300 rounded-full text-[10px] font-medium transition-all shadow-xs"
                      >
                        ⚡ {sugg}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-primary-600"></div>
                <span>SkillBridge AI is synthesizing response...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Ask AI about ${role === 'student' ? 'skills, jobs, resume...' : role === 'academician' ? 'cohort, syllabus, FDPs...' : 'candidates, matching...'}`}
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim() || loading}
              className="p-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

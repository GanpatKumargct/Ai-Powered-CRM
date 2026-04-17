import React from 'react';
import { X, Bot, Mic, LayoutDashboard } from 'lucide-react';

export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <LayoutDashboard className="text-blue-600" />
            About HealthConnect AI
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-6 text-slate-600">
          <p className="text-base leading-relaxed">
            Welcome to <strong className="text-slate-800">HealthConnect AI</strong>, an intelligent CRM system designed specifically for Healthcare Professionals (HCPs) and medical representatives. 
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <Bot className="text-blue-600 mb-3" size={24} />
              <h3 className="font-bold text-slate-800 mb-2">Conversational AI</h3>
              <p className="text-sm">Stop filling out tedious forms manually. Just chat naturally with our AI agent about your meeting, and it will intelligently extract entities like names, dates, sentiments, and topics to populate your CRM instantly.</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <Mic className="text-emerald-600 mb-3" size={24} />
              <h3 className="font-bold text-slate-800 mb-2">100% Local Voice</h3>
              <p className="text-sm">Speak your notes directly into the app using our integrated, browser-based Whisper AI transcription. Enjoy fast, secure, and privacy-preserving voice-to-text without relying on external cloud APIs.</p>
            </div>
          </div>
          
          <p className="text-sm border-t border-slate-100 pt-4 text-slate-500">
            Built using React, Redux Toolkit, FastAPI, PostgreSQL, and LangGraph. The core AI architecture uses Llama-3 interacting with custom tool schema to parse and edit context continuously.
          </p>
        </div>
      </div>
    </div>
  );
}

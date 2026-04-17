import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, setLoading } from '../store/chatSlice';
import { updateForm } from '../store/formSlice';
import axios from 'axios';
import { Send, Bot, User, Sparkles, Mic, Loader2 } from 'lucide-react';
import { useWhisper } from '../hooks/useWhisper';

export default function ChatInterface() {
  const [input, setInput] = useState('');
  const dispatch = useDispatch();
  const { messages, isLoading } = useSelector((state) => state.chat);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    dispatch(addMessage({ sender: 'user', text: userMessage }));
    dispatch(setLoading(true));

    try {
      const response = await axios.post('http://localhost:8000/chat/', {
        message: userMessage
      });

      const { message, data } = response.data;

      // Add agent message
      dispatch(addMessage({ sender: 'agent', text: message }));

      if (data && data.action) {
         // Auto-populate the CRM form
         if (data.action === 'log' || data.action === 'edit' || data.action === 'fetch') {
             // For edit it might just return 1 field, for log all fields
             dispatch(updateForm(data.data));
         }
      }

    } catch (error) {
      console.error(error);
      dispatch(addMessage({ sender: 'agent', text: 'Sorry, I encountered an error. Is the backend running?' }));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const { isRecording, isProcessing, toggleRecording } = useWhisper((text) => {
    setInput((prev) => (prev ? prev + ' ' + text : text));
  });

  return (
    <div className="h-full flex flex-col bg-white rounded-3xl shadow-[0_20px_50px_rgb(0,0,0,0.05)] border border-slate-100 overflow-hidden relative">
      <div className="p-6 border-b border-slate-100 bg-white z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
            <Bot size={22} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-lg">AI CRM Agent</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-xs text-slate-500 font-medium">Online and ready to log</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4 transform -rotate-6 shadow-sm border border-blue-100">
               <Sparkles size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Welcome to AI CRM</h3>
            <p className="text-slate-500 max-w-sm">
              Instead of filling forms, simply chat with me! Say something like: <br/> 
              <span className="font-semibold text-indigo-600 mt-2 block bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100">"Met Dr. Sharma today, discussed insulin, he looked positive."</span>
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'agent' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex-shrink-0 flex items-center justify-center text-white shadow-md shadow-purple-200">
                <Bot size={16} />
              </div>
            )}
            <div 
              className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium ${
                msg.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-sm shadow-md shadow-blue-500/20' 
                  : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm shadow-[0_2px_10px_rgb(0,0,0,0.02)]'
              }`}
            >
              {msg.text}
            </div>
            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600 border border-blue-200">
                <User size={16} />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-end gap-2 justify-start">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex-shrink-0 flex items-center justify-center text-white shadow-md shadow-purple-200">
                <Bot size={16} />
              </div>
            <div className="bg-white border border-slate-100 text-slate-500 p-4 rounded-2xl rounded-bl-sm shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex gap-2 items-center">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-100 z-10 box-border">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Log an interaction..."
              disabled={isLoading}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-full pl-6 pr-12 py-4 outline-none transition-all duration-300 font-medium text-slate-700 disabled:opacity-50"
            />
            <button 
              type="button"
              onClick={toggleRecording}
              disabled={isProcessing}
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Mic size={18} />}
            </button>
          </div>
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-full shadow-md transition-colors"
          >
            <Send size={20} className="translate-x-[1px]" />
          </button>
        </form>
      </div>
    </div>
  );
}

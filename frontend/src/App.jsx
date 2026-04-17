import ChatInterface from './components/ChatInterface';
import InteractionForm from './components/InteractionForm';
import HistoryDrawer from './components/HistoryDrawer';
import { useDispatch } from 'react-redux';
import { toggleHistory } from './store/formSlice';
import { Clock, Info } from 'lucide-react';
import React, { useState } from 'react';
import AboutModal from './components/AboutModal';
import Footer from './components/Footer';

export default function App() {
  const dispatch = useDispatch();
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50 p-6 overscroll-none h-screen overflow-hidden text-slate-800 selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">HealthConnect <span className="text-blue-600">AI</span></h1>
          <p className="text-sm font-medium text-slate-500">Intelligent CRM for HCP Interactions</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAboutOpen(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            <Info size={18} className="text-slate-500" />
            About Project
          </button>
          <button 
            onClick={() => dispatch(toggleHistory())}
            className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-blue-200 transition-all shadow-sm"
          >
            <Clock size={18} className="text-blue-600" />
            History
          </button>
        </div>
      </header>
      
      {/* Main Split Screen Layout */}
      <div className="max-w-7xl mx-auto h-[calc(100vh-170px)] flex gap-8">
        
        {/* Left Side: Auto-Populating Form */}
        <div className="w-[45%] h-full"> 
          <InteractionForm />
        </div>

        {/* Right Side: Chat Interface */}
        <div className="w-[55%] h-full">
          <ChatInterface />
        </div>

      </div>

      <Footer />
      <HistoryDrawer />
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}

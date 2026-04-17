import React from 'react';
import { Mail, Heart } from 'lucide-react';

const LinkedinIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

export default function Footer() {
  return (
    <footer className="mt-4 flex flex-col md:flex-row items-center justify-between text-sm text-slate-500 max-w-7xl mx-auto h-[40px]">
      <div className="flex items-center gap-1">
        Made with <Heart size={14} className="text-red-500 fill-red-500" /> by <span className="font-bold text-slate-700">Ganpat Kumar</span>
      </div>
      <div className="flex items-center gap-5 mt-2 md:mt-0">
        <a href="mailto:ganpatkumardev@gmail.com" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
          <Mail size={16} /> ganpatkumardev@gmail.com
        </a>
        <a href="https://www.linkedin.com/in/ganpatkumar1/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
          <LinkedinIcon size={16} /> LinkedIn
        </a>
      </div>
    </footer>
  );
}

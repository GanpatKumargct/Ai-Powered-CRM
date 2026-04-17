import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleHistory, setHistory, updateForm } from '../store/formSlice';
import axios from 'axios';
import { X, Calendar, User, MessageSquare, Trash2, RefreshCw } from 'lucide-react';

export default function HistoryDrawer() {
  const { history, isHistoryOpen } = useSelector((state) => state.form);
  const dispatch = useDispatch();

  const fetchHistory = async () => {
    try {
      const response = await axios.get('http://localhost:8000/interaction/');
      dispatch(setHistory(response.data));
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this interaction?")) {
      try {
        await axios.delete(`http://localhost:8000/interaction/${id}`);
        fetchHistory();
      } catch (error) {
        console.error('Error deleting interaction:', error);
        alert("Failed to delete interaction.");
      }
    }
  };

  const handleEdit = (record) => {
    dispatch(updateForm(record));
    dispatch(toggleHistory());
  };

  useEffect(() => {
    if (isHistoryOpen) {
      fetchHistory();
    }
  }, [isHistoryOpen]);

  if (!isHistoryOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => dispatch(toggleHistory())}></div>
      
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Interaction History</h2>
              <p className="text-sm text-slate-500">View your past HCP interactions</p>
            </div>
            <div className="flex items-center gap-2">
               <button 
                onClick={fetchHistory}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                title="Refresh history"
              >
                <RefreshCw size={20} />
              </button>
              <button 
                onClick={() => dispatch(toggleHistory())}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/30">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare size={32} className="text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">No interactions found.</p>
                <p className="text-xs text-slate-400 mt-1">Start chatting with the AI to log interactions.</p>
              </div>
            ) : (
              history.map((record) => (
                <div 
                  key={record.id} 
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                          <User size={16} />
                       </div>
                       <h3 className="font-bold text-slate-800">{record.hcp_name}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      record.sentiment === 'Positive' ? 'bg-emerald-50 text-emerald-600' :
                      record.sentiment === 'Negative' ? 'bg-red-50 text-red-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {record.sentiment || 'Neutral'}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400" />
                      <span>{record.date} • {record.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare size={14} className="text-slate-400" />
                      <span className="line-clamp-2 italic">"{record.topics_discussed}"</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[11px] font-medium text-slate-400">{record.interaction_type}</span>
                    <div className="flex gap-4 items-center">
                      <button onClick={() => handleDelete(record.id)} className="text-[11px] font-bold text-red-500 hover:underline flex items-center gap-1">
                        <Trash2 size={12} /> Delete
                      </button>
                      <button onClick={() => handleEdit(record)} className="text-[11px] font-bold text-blue-600 hover:underline">
                        Edit / Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateFormField } from '../store/formSlice';
import { Mic, MicOff, Search, Plus, Loader2, Save, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useWhisper } from '../hooks/useWhisper';
import { resetForm } from '../store/formSlice';

export default function InteractionForm() {
  const formState = useSelector((state) => state.form);
  const dispatch = useDispatch();
  
  const topicsRef = useRef(formState.topics_discussed);
  useEffect(() => {
    topicsRef.current = formState.topics_discussed;
  }, [formState.topics_discussed]);

  const { isRecording, isProcessing, toggleRecording } = useWhisper((text) => {
    const currentTopics = topicsRef.current ? topicsRef.current + ' ' : '';
    dispatch(updateFormField({ 
      field: 'topics_discussed', 
      value: (currentTopics + text).trim() 
    }));
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const { 
        id, hcp_name, interaction_type, date, time, attendees, 
        topics_discussed, materials_shared, samples_distributed, 
        sentiment, outcomes, follow_up_actions 
      } = formState;

      const payload = {
        hcp_name,
        interaction_type,
        date: date === '' ? null : date,
        time: time === '' ? null : time,
        attendees,
        topics_discussed,
        materials_shared,
        samples_distributed,
        sentiment,
        outcomes,
        follow_up_actions
      };

      if (id) {
        await axios.put(`http://localhost:8000/interaction/${id}`, payload);
      } else {
        await axios.post('http://localhost:8000/interaction/', payload);
      }
      
      setSaveStatus('success');
      setTimeout(() => {
        setSaveStatus(null);
        dispatch(resetForm());
      }, 2000);
    } catch (error) {
      console.error('Error saving interaction:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const clearForm = () => {
    dispatch(resetForm());
  };

  const handleChange = (field, value) => {
    dispatch(updateFormField({ field, value }));
  };

  return (
    <div className="h-full w-full bg-white rounded-3xl shadow-[0_20px_50px_rgb(0,0,0,0.05)] border border-slate-100 p-8 flex flex-col font-sans">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">{formState.id ? 'Edit Interaction' : 'Log HCP Interaction'}</h2>
        {formState.id && <span className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">Edit Mode</span>}
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto pr-4 custom-scrollbar">
        {/* Interaction Details Section */}
        <div>
          <h3 className="text-md font-semibold text-slate-700 mb-4">Interaction Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">HCP Name</label>
              <input 
                type="text" 
                value={formState.hcp_name || ''}
                onChange={(e) => handleChange('hcp_name', e.target.value)}
                placeholder="Search or select HCP..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Interaction Type</label>
              <select 
                value={formState.interaction_type || 'Meeting'}
                onChange={(e) => handleChange('interaction_type', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="Meeting">Meeting</option>
                <option value="Call">Call</option>
                <option value="Email">Email</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Date</label>
              <input 
                type="date" 
                value={formState.date || ''}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Time</label>
              <input 
                type="time" 
                value={formState.time || ''}
                onChange={(e) => handleChange('time', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Attendees */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">Attendees</label>
          <input 
            type="text" 
            value={formState.attendees || ''}
            onChange={(e) => handleChange('attendees', e.target.value)}
            placeholder="Enter names or search..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Topics Discussed */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">Topics Discussed</label>
          <textarea 
            rows="3"
            value={formState.topics_discussed || ''}
            onChange={(e) => handleChange('topics_discussed', e.target.value)}
            placeholder="Enter key discussion points..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button 
            type="button"
            onClick={toggleRecording}
            disabled={isProcessing}
            className={`mt-2 flex items-center gap-2 text-sm font-medium ${isRecording ? 'text-red-500 animate-pulse' : 'text-blue-500'} hover:opacity-80 transition-opacity ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : (isRecording ? <MicOff size={16} /> : <Mic size={16} />)}
            {isProcessing ? 'Transcribing...' : (isRecording ? 'Stop Recording' : 'Summarize from Voice Note (Local Whisper)')}
          </button>
        </div>

        {/* Materials Shared / Samples Distributed */}
        <div>
          <h3 className="text-md font-semibold text-slate-700 mb-4">Materials Shared / Samples Distributed</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Materials Shared</label>
              <div className="flex gap-2 items-center">
                 <input 
                  type="text" 
                  value={formState.materials_shared || ''}
                  onChange={(e) => handleChange('materials_shared', e.target.value)}
                  placeholder="Brochures."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button type="button" className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors">
                  <Search size={14} /> Search/Add
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Samples Distributed</label>
              <div className="flex gap-2 items-center">
                <input 
                  type="text" 
                  value={formState.samples_distributed || ''}
                  onChange={(e) => handleChange('samples_distributed', e.target.value)}
                  placeholder="No samples added."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button type="button" className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors">
                  <Plus size={14} /> Add Sample
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Observed/Inferred HCP Sentiment */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-2">Observed/Inferred HCP Sentiment</label>
          <div className="flex gap-6 items-center">
            {['Positive', 'Neutral', 'Negative'].map((sent) => (
              <label key={sent} className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input 
                  type="radio" 
                  name="sentiment" 
                  value={sent}
                  checked={formState.sentiment?.toLowerCase() === sent.toLowerCase()}
                  onChange={(e) => handleChange('sentiment', e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                {sent === 'Positive' ? '😃' : sent === 'Neutral' ? '😐' : '😠'} {sent}
              </label>
            ))}
          </div>
        </div>

        {/* Outcomes */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">Outcomes</label>
          <textarea 
            rows="2"
            value={formState.outcomes || ''}
            onChange={(e) => handleChange('outcomes', e.target.value)}
            placeholder="Key outcomes or agreements..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Follow-up Actions */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">Follow-up Actions</label>
          <textarea 
            rows="2"
            value={formState.follow_up_actions || ''}
            onChange={(e) => handleChange('follow_up_actions', e.target.value)}
            placeholder="Enter follow-up actions..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

      </div>

      {/* Footer Actions */}
      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {saveStatus === 'success' && (
             <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-bold animate-in fade-in slide-in-from-left-2 transition-all">
              <CheckCircle size={16} /> {formState.id ? 'Updated Successfully!' : 'Successfully Logged!'}
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center gap-1.5 text-red-600 text-sm font-bold animate-in fade-in slide-in-from-left-2 transition-all">
              <AlertCircle size={16} /> Error saving.
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {formState.id && (
            <button 
              onClick={clearForm}
              className="px-6 py-3 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all text-sm"
            >
              Cancel
            </button>
          )}
          <button 
            onClick={handleSave}
            disabled={isSaving || !formState.hcp_name}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-200 active:scale-95 flex-shrink-0"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isSaving ? 'Saving...' : (formState.id ? 'Update Interaction' : 'Save Interaction')}
          </button>
        </div>
      </div>
    </div>
  );
}

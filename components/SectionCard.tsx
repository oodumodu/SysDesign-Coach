import React, { useCallback, useState } from 'react';
import { SectionConfig, SectionState, SectionStatus } from '../types';
import { analyzeSectionContent, getSectionMissedPoints } from '../services/geminiService';

interface SectionCardProps {
  config: SectionConfig;
  state: SectionState;
  problemTitle: string;
  onUpdate: (id: string, updates: Partial<SectionState>) => void;
  isGlobalSubmitting: boolean;
}

const SectionCard: React.FC<SectionCardProps> = ({ config, state, problemTitle, onUpdate, isGlobalSubmitting }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(config.id, { content: e.target.value, status: SectionStatus.IDLE });
  };

  const handleAnalyze = useCallback(async () => {
    if (!state.content.trim()) return;
    
    setIsAnalyzing(true);
    onUpdate(config.id, { status: SectionStatus.ANALYZING });

    try {
      const result = await analyzeSectionContent(
        problemTitle,
        config.title, 
        config.description, 
        state.content
      );
      
      if (result.status === 'PASS') {
        onUpdate(config.id, { 
          status: SectionStatus.PASSED, 
          feedback: null 
        });
      } else {
        onUpdate(config.id, { 
          status: SectionStatus.NEEDS_REVISION, 
          feedback: result.message 
        });
      }
    } catch (error) {
        console.error(error);
        onUpdate(config.id, { status: SectionStatus.IDLE, feedback: "Error connecting to AI." });
    } finally {
      setIsAnalyzing(false);
    }
  }, [config.id, config.title, config.description, state.content, problemTitle, onUpdate]);

  const handleGiveUp = useCallback(async () => {
    setIsRevealing(true);
    onUpdate(config.id, { status: SectionStatus.ANALYZING });

    try {
      const solution = await getSectionMissedPoints(
        problemTitle,
        config.title,
        config.description,
        state.content
      );
      
      onUpdate(config.id, { 
        status: SectionStatus.NEEDS_REVISION, // Use this status to show the feedback box
        feedback: `KEY POINTS MISSED:\n${solution}` 
      });
    } catch (error) {
      console.error(error);
      onUpdate(config.id, { status: SectionStatus.IDLE, feedback: "Error retrieving solution." });
    } finally {
      setIsRevealing(false);
    }
  }, [config.id, config.title, config.description, state.content, problemTitle, onUpdate]);

  const getStatusColor = () => {
    switch (state.status) {
      case SectionStatus.PASSED: return 'border-green-500 bg-green-50/50';
      case SectionStatus.NEEDS_REVISION: return 'border-orange-400 bg-orange-50/50';
      case SectionStatus.ANALYZING: return 'border-blue-400 bg-blue-50/50';
      default: return 'border-gray-200 bg-white';
    }
  };

  const isIdleOrNeedsRevision = state.status === SectionStatus.IDLE || state.status === SectionStatus.NEEDS_REVISION;

  return (
    <div className={`rounded-xl border-2 transition-all duration-300 p-5 ${getStatusColor()}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-lg font-bold text-gray-800">{config.title}</h4>
          <p className="text-gray-500 text-sm mt-0.5">{config.description}</p>
        </div>
        <div className="flex-shrink-0 ml-4">
          {state.status === SectionStatus.PASSED && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-200 text-green-800">
              ✓
            </span>
          )}
           {state.status === SectionStatus.NEEDS_REVISION && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-200 text-orange-800">
              Feedback
            </span>
          )}
        </div>
      </div>

      <textarea
        className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow resize-y text-gray-700 bg-white text-sm"
        placeholder={config.placeholder}
        value={state.content}
        onChange={handleTextChange}
        disabled={isAnalyzing || isRevealing || isGlobalSubmitting}
      />

      {state.feedback && state.status === SectionStatus.NEEDS_REVISION && (
        <div className="mt-3 p-3 bg-white/80 rounded-lg border-l-4 border-orange-400 shadow-sm animate-fade-in">
          <p className="text-orange-800 font-medium text-xs sm:text-sm flex items-start gap-2 whitespace-pre-wrap">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span className="flex-1">{state.feedback}</span>
          </p>
        </div>
      )}

      <div className="mt-3 flex flex-wrap justify-end gap-3">
        {state.status !== SectionStatus.PASSED && (
          <button
            onClick={handleGiveUp}
            disabled={isAnalyzing || isRevealing || isGlobalSubmitting}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {isRevealing ? 'Loading...' : 'I give up, what did I miss?'}
          </button>
        )}
        
        <button
          onClick={handleAnalyze}
          disabled={!state.content.trim() || isAnalyzing || isRevealing || isGlobalSubmitting || state.status === SectionStatus.PASSED}
          className={`px-4 py-1.5 rounded-lg font-semibold text-xs uppercase tracking-wide transition-colors flex items-center gap-2
            ${state.status === SectionStatus.PASSED 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm'
            }`}
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Checking...
            </>
          ) : state.status === SectionStatus.PASSED ? (
             'Approved'
          ) : (
            'Validate Answer'
          )}
        </button>
      </div>
    </div>
  );
};

export default React.memo(SectionCard);
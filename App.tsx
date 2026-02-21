import React, { useState, useMemo } from 'react';
import { SYSTEM_DESIGN_SECTIONS, SYSTEM_DESIGN_PROBLEMS } from './constants';
import { SectionState, SectionStatus, GradeResult, SectionConfig, ProblemDefinition } from './types';
import SectionCard from './components/SectionCard';
import FinalGrade from './components/FinalGrade';
import { gradeInterviewSession, generateProblemDefinition } from './services/geminiService';

const App: React.FC = () => {
  const [currentProblem, setCurrentProblem] = useState<ProblemDefinition>(SYSTEM_DESIGN_PROBLEMS[0]);
  const [customTopic, setCustomTopic] = useState('');
  const [isGeneratingProblem, setIsGeneratingProblem] = useState(false);
  
  // Initialize state for all sections
  const [sectionsState, setSectionsState] = useState<SectionState[]>(() => 
    SYSTEM_DESIGN_SECTIONS.map(section => ({
      id: section.id,
      content: '',
      status: SectionStatus.IDLE,
      feedback: null,
    }))
  );

  const [isGrading, setIsGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null);

  const handleUpdateSection = (id: string, updates: Partial<SectionState>) => {
    setSectionsState(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const resetInterview = () => {
    setSectionsState(SYSTEM_DESIGN_SECTIONS.map(section => ({
      id: section.id,
      content: '',
      status: SectionStatus.IDLE,
      feedback: null,
    })));
    setGradeResult(null);
    window.scrollTo(0, 0);
  };

  const handleSetProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) return;

    const hasContent = sectionsState.some(s => s.content.trim().length > 0);
    if (hasContent) {
      if (!window.confirm("Changing the problem will reset your current answers. Are you sure?")) {
        return;
      }
    }

    setIsGeneratingProblem(true);
    try {
      const problemDef = await generateProblemDefinition(customTopic);
      setCurrentProblem(problemDef);
      resetInterview();
      setCustomTopic(''); // Clear input after setting
    } catch (error) {
      console.error(error);
      alert("Could not generate problem. Please try again.");
    } finally {
      setIsGeneratingProblem(false);
    }
  };

  const handleFinishAndGrade = async () => {
    const hasContent = sectionsState.some(s => s.content.trim().length > 0);
    if (!hasContent) {
      alert("Please fill out at least one section before finishing.");
      return;
    }

    setIsGrading(true);
    try {
      // Reconstruct the full submission with section titles for the grader
      const dataToGrade = sectionsState.map((s) => {
        const config = SYSTEM_DESIGN_SECTIONS.find(c => c.id === s.id);
        return {
          title: config ? `${config.category} - ${config.title}` : s.id,
          content: s.content
        };
      });
      
      const result = await gradeInterviewSession(currentProblem.title, dataToGrade);
      setGradeResult(result);
    } catch (e) {
      console.error(e);
      alert("Failed to grade the interview. Please try again.");
    } finally {
      setIsGrading(false);
    }
  };

  const completedCount = sectionsState.filter(s => s.status === SectionStatus.PASSED).length;
  const totalCount = SYSTEM_DESIGN_SECTIONS.length;
  const progress = Math.round((completedCount / totalCount) * 100);

  // Group sections by category for rendering
  const groupedSections = useMemo<Record<string, SectionConfig[]>>(() => {
    const groups: Record<string, SectionConfig[]> = {};
    SYSTEM_DESIGN_SECTIONS.forEach(section => {
      if (!groups[section.category]) {
        groups[section.category] = [];
      }
      groups[section.category].push(section);
    });
    return groups;
  }, []);

  // If showing results, render the grade component
  if (gradeResult) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <FinalGrade result={gradeResult} onReset={resetInterview} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">SysDesign AI</h1>
            <p className="text-indigo-200 text-xs hidden sm:block">Interactive Interview Coach</p>
          </div>
          
          <div className="w-full sm:w-auto flex flex-row items-center justify-between sm:justify-end gap-4">
             <div className="text-right hidden sm:block">
                <div className="text-xs text-indigo-200 font-medium uppercase">Progress</div>
                <div className="font-bold">{progress}%</div>
             </div>
             <button
               onClick={handleFinishAndGrade}
               disabled={isGrading || isGeneratingProblem}
               className="bg-white text-indigo-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-50 transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
             >
               {isGrading ? 'Grading...' : 'Finish & Grade'}
             </button>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-indigo-900 h-1 mt-4 sm:mt-0">
            <div 
              className="bg-indigo-300 h-1 transition-all duration-500 ease-in-out" 
              style={{ width: `${progress}%` }}
            ></div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
            <div className="flex-1">
               <h2 className="text-3xl font-bold text-gray-900">{currentProblem.title}</h2>
            </div>
            
            <form onSubmit={handleSetProblem} className="relative w-full md:w-80 flex gap-2 items-end">
              <div className="flex-1">
                <label htmlFor="custom-topic" className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                  New Design Topic
                </label>
                <input 
                  id="custom-topic"
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="e.g. Netflix, Parking Lot..."
                  className="block w-full px-3 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg border shadow-sm bg-white"
                  disabled={isGeneratingProblem}
                />
              </div>
              <button 
                type="submit"
                disabled={!customTopic.trim() || isGeneratingProblem}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm h-[38px] flex items-center justify-center min-w-[60px]"
              >
                 {isGeneratingProblem ? (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 ) : 'Set'}
              </button>
            </form>
          </div>

          <p className="text-gray-600 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
             <strong className="block text-gray-800 mb-1">Problem Statement:</strong> 
             {isGeneratingProblem ? (
               <span className="text-gray-400 italic">Generating problem definition...</span>
             ) : (
               currentProblem.description
             )}
          </p>
        </div>

        <div className="space-y-12">
          {Object.entries(groupedSections).map(([category, sections]) => (
            <div key={category} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">{category}</h3>
              </div>
              <div className="p-6 space-y-8">
                {(sections as SectionConfig[]).map(config => (
                  <SectionCard
                    key={config.id}
                    config={config}
                    state={sectionsState.find(s => s.id === config.id)!}
                    problemTitle={currentProblem.title}
                    onUpdate={handleUpdateSection}
                    isGlobalSubmitting={isGrading}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center pb-12">
           <button
             onClick={handleFinishAndGrade}
             disabled={isGrading || isGeneratingProblem}
             className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-xl hover:bg-indigo-700 transition-transform transform hover:-translate-y-1 disabled:opacity-70 disabled:transform-none"
           >
             {isGrading ? (
                 <span className="flex items-center justify-center gap-2">
                   <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   Analyzing Entire Interview...
                 </span>
             ) : 'Complete Interview & View Score'}
           </button>
        </div>
      </main>
    </div>
  );
};

export default App;
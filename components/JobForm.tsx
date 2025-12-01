import React, { useState, useEffect } from 'react';
import { JobPostRequest } from '../types';
import { Sparkles, Loader2, Terminal, CheckCircle2, Circle } from 'lucide-react';

interface JobFormProps {
  onSubmit: (data: JobPostRequest) => void;
  isLoading: boolean;
}

interface PromptAnalysis {
  hasRole: boolean;
  hasExperience: boolean;
  hasSkills: boolean;
  hasCompensation: boolean;
  hasLocation: boolean;
}

export const JobForm: React.FC<JobFormProps> = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [analysis, setAnalysis] = useState<PromptAnalysis>({
    hasRole: false,
    hasExperience: false,
    hasSkills: false,
    hasCompensation: false,
    hasLocation: false,
  });

  // Heuristics to detect key information in the prompt
  useEffect(() => {
    const lower = prompt.toLowerCase();
    setAnalysis({
      hasRole: /hiring|need|looking for|role|position|title|developer|engineer|manager|designer|lead|analyst|specialist|officer|director|vp|consultant|admin/i.test(lower),
      hasExperience: /year|exp|senior|junior|entry|level|background|track record|history|fresh/i.test(lower),
      hasSkills: /skill|proficien|stack|tool|know|able to|familiar|expert|mastery|technolog|framework|language/i.test(lower),
      hasCompensation: /\$|salary|pay|rate|comp|benefit|bonus|equity|stock|wage|budget|per hour|annual/i.test(lower),
      hasLocation: /remote|hybrid|site|office|locat|city|country|based in|relocat/i.test(lower),
    });
  }, [prompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onSubmit({ prompt });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e as any);
    }
  };

  const checklistItems = [
    { label: 'Job Title', active: analysis.hasRole },
    { label: 'Experience Level', active: analysis.hasExperience },
    { label: 'Key Skills', active: analysis.hasSkills },
    { label: 'Compensation', active: analysis.hasCompensation },
    { label: 'Location/Remote', active: analysis.hasLocation },
  ];

  return (
    <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
        <div className="flex items-center">
          <Terminal className="w-5 h-5 text-brand-400 mr-2" />
          <h2 className="text-lg font-semibold text-white">
            Job Prompt
          </h2>
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
          Markdown Mode
        </span>
      </div>

      <form onSubmit={handleSubmit} className="p-6 flex-grow flex flex-col space-y-6 bg-slate-900">
        <div className="flex-grow relative group">
          <textarea
            id="prompt"
            name="prompt"
            required
            placeholder="E.g., We are looking for a Senior React Developer with 5+ years of experience. Remote role. Salary $120k-$150k. Must know TypeScript and Node.js..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            className="block w-full h-full min-h-[250px] resize-none rounded-xl bg-slate-950 border-slate-800 text-slate-200 placeholder-slate-600 shadow-inner focus:border-brand-500 focus:ring-1 focus:ring-brand-500 sm:text-base p-5 transition-all font-mono leading-relaxed"
          />
          <div className="absolute bottom-4 right-4 text-xs text-slate-600 pointer-events-none hidden sm:block opacity-50 group-hover:opacity-100 transition-opacity">
            Cmd + Enter to generate
          </div>
        </div>

        {/* Real-time Checklist */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Detected Details
          </label>
          <div className="flex flex-wrap gap-2">
            {checklistItems.map((item, index) => (
              <div
                key={index}
                className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-300 ${
                  item.active
                    ? 'bg-brand-900/30 border-brand-500/50 text-brand-200'
                    : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}
              >
                {item.active ? (
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-brand-400" />
                ) : (
                  <Circle className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
                )}
                {item.label}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className={`w-full flex justify-center py-4 px-4 border rounded-xl shadow-lg text-base font-medium transition-all
              ${isLoading || !prompt.trim()
                ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed' 
                : 'bg-brand-600 border-transparent text-white hover:bg-brand-500 hover:shadow-brand-900/30 active:scale-[0.99]'
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Job Post
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

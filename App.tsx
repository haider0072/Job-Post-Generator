import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { JobForm } from './components/JobForm';
import { JobPreview } from './components/JobPreview';
import { JobPostRequest } from './types';
import { generateJobPost } from './services/geminiService';
import { AlertCircle, Briefcase, Lock, ChevronRight } from 'lucide-react';

const App: React.FC = () => {
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [jobPostContent, setJobPostContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      try {
        if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
          setHasKey(true);
        }
      } catch (e) {
        console.error("Error checking API key status", e);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkKey();
  }, []);

  const handleLogin = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        // Assuming success allows us to proceed immediately to avoid race conditions
        setHasKey(true);
      } catch (e) {
        console.error("Error selecting key", e);
        setError("Failed to connect. Please try again.");
      }
    } else {
      setError("Authentication service not available.");
    }
  };

  const handleFormSubmit = async (data: JobPostRequest) => {
    setIsLoading(true);
    setError(null);
    setJobPostContent(null);

    try {
      const result = await generateJobPost(data);
      setJobPostContent(result);
    } catch (err) {
      setError("Something went wrong while communicating with the AI. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state for initial auth check
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Login Screen
  if (!hasKey) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden">
          <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-brand-600"></div>
            <div className="bg-slate-800/50 inline-flex p-3 rounded-xl mb-4 border border-slate-700">
              <Briefcase className="w-8 h-8 text-brand-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">JobCraft AI</h1>
            <p className="text-slate-400 text-sm">Professional Job Post Generator</p>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="space-y-4">
               <div className="flex items-start space-x-3">
                 <div className="bg-brand-50 p-2 rounded-lg flex-shrink-0">
                    <Lock className="w-5 h-5 text-brand-600" />
                 </div>
                 <div>
                    <h3 className="font-medium text-gray-900">Secure Access</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Connect your Google account to use your own Gemini API quota. Your key is handled securely by Google.
                    </p>
                 </div>
               </div>
            </div>

            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium shadow-lg hover:shadow-brand-900/20 transition-all active:scale-[0.98] group"
            >
              Connect with Google
              <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="text-center">
              <p className="text-xs text-gray-400">
                By connecting, you agree to use a paid cloud project for billing. 
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 hover:underline ml-1">
                  Learn more about billing
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main App
  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-8rem)] min-h-[600px]">
        <div className="h-full">
          <JobForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        </div>

        <div className="h-full relative">
           {error && (
            <div className="absolute top-4 left-4 right-4 z-20 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start shadow-lg animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Error</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="mt-2 text-xs text-red-600 font-medium hover:text-red-800 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
          <JobPreview content={jobPostContent} isLoading={isLoading} />
        </div>
      </div>
    </Layout>
  );
};

export default App;

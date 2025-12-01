import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { JobForm } from './components/JobForm';
import { JobPreview } from './components/JobPreview';
import { JobPostRequest } from './types';
import { generateJobPost } from './services/geminiService';
import { AlertCircle, Briefcase, Lock, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [jobPostContent, setJobPostContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

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
    setIsLoggingIn(true);
    setError(null);
    
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        // Assuming success allows us to proceed immediately to avoid race conditions
        setHasKey(true);
      } catch (e) {
        console.error("Error selecting key", e);
        setError("Connection failed or cancelled. Please try again.");
        setIsLoggingIn(false);
      }
    } else {
      setError("Google AI Studio authentication is not available in this environment.");
      setIsLoggingIn(false);
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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full overflow-hidden">
          <div className="p-8 text-center">
            <div className="bg-brand-50 inline-flex p-4 rounded-full mb-6 ring-8 ring-brand-50/50">
              <Briefcase className="w-8 h-8 text-brand-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome to JobCraft AI</h1>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Create professional, engaging job posts in seconds. <br/>
              Please sign in to continue.
            </p>
            
            {/* Error Message for Login */}
            {error && (
              <div className="mb-6 mx-auto w-full bg-red-50 border border-red-200 rounded-lg p-3 flex items-start text-left animate-fade-in">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            <div className="space-y-4">
               <button
                type="button"
                onClick={handleLogin}
                disabled={isLoggingIn}
                className={`w-full flex items-center justify-center py-3.5 px-4 border rounded-lg font-medium shadow-sm transition-all active:scale-[0.98] group relative overflow-hidden
                  ${isLoggingIn 
                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-3 text-brand-600" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <div className="mr-3">
                      <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </div>
                    Login with Google
                  </>
                )}
              </button>

               <div className="flex items-center justify-center space-x-2 text-xs text-slate-400 mt-6">
                 <Lock className="w-3 h-3" />
                 <span>Secure access via your Gemini API key</span>
               </div>
            </div>
          </div>
          
          <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              By logging in, you agree to use a paid cloud project.
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 hover:underline ml-1 font-medium">
                Billing Info
              </a>
            </p>
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
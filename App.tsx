import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { JobForm } from './components/JobForm';
import { JobPreview } from './components/JobPreview';
import { JobPostRequest } from './types';
import { generateJobPost } from './services/geminiService';
import { AlertCircle, Briefcase, Lock, Loader2, LogOut } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [jobPostContent, setJobPostContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);
  const [tempApiKey, setTempApiKey] = useState<string>('');

  useEffect(() => {
    // Check if user has existing API key in localStorage
    const storedApiKey = localStorage.getItem('gemini_api_key');
    const storedEmail = localStorage.getItem('user_email');

    if (storedApiKey && storedEmail) {
      setApiKey(storedApiKey);
      setUserEmail(storedEmail);
    }

    setCheckingAuth(false);
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);

    if (!GOOGLE_CLIENT_ID) {
      setError("Google Client ID is not configured. Please check your environment variables.");
      setIsLoggingIn(false);
      return;
    }

    try {
      if (!window.google) {
        throw new Error("Google Identity Services not loaded");
      }

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
        callback: async (response: { access_token: string }) => {
          if (response.access_token) {
            // Get user info from Google
            try {
              const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                  Authorization: `Bearer ${response.access_token}`,
                },
              });

              if (userInfoResponse.ok) {
                const userInfo = await userInfoResponse.json();
                setUserEmail(userInfo.email);
                localStorage.setItem('user_email', userInfo.email);

                // Now show API key input
                setShowApiKeyInput(true);
              }
            } catch (err) {
              console.error("Error fetching user info:", err);
              setError("Failed to get user information");
            }

            setIsLoggingIn(false);
          }
        },
      });

      tokenClient.requestAccessToken();
    } catch (e) {
      console.error("Error during login:", e);
      setError("Failed to initialize Google Sign-In. Please try again.");
      setIsLoggingIn(false);
    }
  };

  const handleApiKeySubmit = () => {
    if (!tempApiKey.trim()) {
      setError("Please enter your Gemini API key");
      return;
    }

    setApiKey(tempApiKey);
    localStorage.setItem('gemini_api_key', tempApiKey);
    setShowApiKeyInput(false);
    setTempApiKey('');
  };

  const handleLogout = () => {
    setApiKey(null);
    setUserEmail(null);
    setJobPostContent(null);
    setShowApiKeyInput(false);
    setTempApiKey('');
    localStorage.removeItem('gemini_api_key');
    localStorage.removeItem('user_email');
  };

  const handleFormSubmit = async (data: JobPostRequest) => {
    if (!apiKey) {
      setError("Please provide your API key first");
      return;
    }

    setIsLoading(true);
    setError(null);
    setJobPostContent(null);

    try {
      const result = await generateJobPost({
        ...data,
        accessToken: apiKey,
      });
      setJobPostContent(result);
    } catch (err: any) {
      const errorMessage = err.message || "Something went wrong while communicating with the AI. Please try again.";

      if (errorMessage.includes('API key') || errorMessage.includes('401')) {
        setError("Invalid API key. Please check your API key and try again.");
      } else {
        setError(errorMessage);
      }
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

  // API Key Input Screen
  if (showApiKeyInput) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full overflow-hidden">
          <div className="p-8">
            <div className="bg-brand-50 inline-flex p-4 rounded-full mb-6 ring-8 ring-brand-50/50">
              <Lock className="w-8 h-8 text-brand-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Enter Your Gemini API Key</h1>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              You're signed in as <strong>{userEmail}</strong><br/>
              Now enter your Gemini API key to start generating job posts.
            </p>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start text-left">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <input
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApiKeySubmit()}
                placeholder="Enter your Gemini API key"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
              <button
                onClick={handleApiKeySubmit}
                className="w-full bg-brand-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-brand-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>

          <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Don't have an API key?
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 hover:underline ml-1 font-medium">
                Get one here
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Login Screen
  if (!apiKey) {
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
              Sign in with Google to get started.
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
                    Sign in with Google
                  </>
                )}
              </button>

               <div className="flex items-center justify-center space-x-2 text-xs text-slate-400 mt-6">
                 <Lock className="w-3 h-3" />
                 <span>Secure authentication</span>
               </div>
            </div>
          </div>

          <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Your Google Cloud account will be used to access Gemini API.
              <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 hover:underline ml-1 font-medium">
                Learn more
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main App
  return (
    <Layout userEmail={userEmail} onLogout={handleLogout}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-8rem)] min-h-[600px] max-h-[calc(100vh-8rem)]">
        <div className="h-full min-h-0 overflow-hidden">
          <JobForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        </div>

        <div className="h-full min-h-0 overflow-hidden relative">
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
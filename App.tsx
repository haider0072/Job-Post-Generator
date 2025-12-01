import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { JobForm } from './components/JobForm';
import { JobPreview } from './components/JobPreview';
import { JobPostRequest } from './types';
import { generateJobPost } from './services/geminiService';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [jobPostContent, setJobPostContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (data: JobPostRequest) => {
    setIsLoading(true);
    setError(null);
    setJobPostContent(null); // Clear previous content while loading to show spinner

    try {
      const result = await generateJobPost(data);
      setJobPostContent(result);
    } catch (err) {
      setError("Something went wrong while communicating with the AI. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-8rem)] min-h-[600px]">
        {/* Left Column: Form */}
        <div className="h-full">
          <JobForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        </div>

        {/* Right Column: Preview */}
        <div className="h-full relative">
           {error && (
            <div className="absolute top-4 left-4 right-4 z-20 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start shadow-lg animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Generation Failed</h4>
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

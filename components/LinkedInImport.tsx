import React, { useState } from 'react';
import { Organization } from '../types';
import { Linkedin, Loader2, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';

interface LinkedInImportProps {
  userId: string;
  onSuccess: (organization: Organization) => void;
}

export const LinkedInImport: React.FC<LinkedInImportProps> = ({ userId, onSuccess }) => {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<Organization | null>(null);

  const validateLinkedInUrl = (url: string): boolean => {
    const pattern = /^https?:\/\/(www\.)?linkedin\.com\/company\/[^\/\s]+\/?$/i;
    return pattern.test(url.trim());
  };

  const handleFetch = async () => {
    setError(null);
    setPreviewData(null);

    if (!linkedinUrl.trim()) {
      setError('Please enter a LinkedIn company URL');
      return;
    }

    if (!validateLinkedInUrl(linkedinUrl)) {
      setError('Invalid LinkedIn URL. Format: https://linkedin.com/company/company-name');
      return;
    }

    setIsLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

      const response = await fetch(`${API_BASE_URL}/api/scrape-linkedin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkedinUrl: linkedinUrl.trim(),
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch company data');
      }

      const result = await response.json();
      setPreviewData(result.organization);
    } catch (err: any) {
      console.error('LinkedIn import error:', err);
      setError(err.message || 'Failed to import from LinkedIn');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (previewData) {
      onSuccess(previewData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
        <Linkedin className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">How to find your company's LinkedIn URL:</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-700">
            <li>Go to LinkedIn and search for your company</li>
            <li>Copy the URL from your company's page</li>
            <li>Paste it below (e.g., https://linkedin.com/company/google)</li>
          </ol>
        </div>
      </div>

      {/* URL Input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          LinkedIn Company Page URL
        </label>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
              placeholder="https://linkedin.com/company/your-company"
              disabled={isLoading}
              className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>
          <button
            onClick={handleFetch}
            disabled={isLoading || !linkedinUrl.trim()}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center ${
              isLoading || !linkedinUrl.trim()
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-brand-600 text-white hover:bg-brand-700'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Fetching...
              </>
            ) : (
              'Fetch Data'
            )}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Example: https://linkedin.com/company/microsoft or https://linkedin.com/company/google
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Preview */}
      {previewData && (
        <div className="border-2 border-brand-200 rounded-lg p-6 bg-brand-50/30 animate-fade-in">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <CheckCircle2 className="w-6 h-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-slate-900">Company Data Retrieved</h3>
            </div>
            {previewData.linkedin_url && (
              <a
                href={previewData.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 hover:text-brand-700 flex items-center text-sm"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                View on LinkedIn
              </a>
            )}
          </div>

          <div className="space-y-4">
            {/* Company Logo */}
            {previewData.logo_url && (
              <div className="flex justify-center pb-4 border-b border-slate-200">
                <img
                  src={previewData.logo_url}
                  alt={previewData.name}
                  className="h-16 w-16 object-contain rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Company Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              {previewData.name && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Company Name</p>
                  <p className="text-sm font-semibold text-slate-900">{previewData.name}</p>
                </div>
              )}

              {previewData.industry && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Industry</p>
                  <p className="text-sm text-slate-700">{previewData.industry}</p>
                </div>
              )}

              {previewData.location && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Location</p>
                  <p className="text-sm text-slate-700">{previewData.location}</p>
                </div>
              )}

              {previewData.company_size && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Company Size</p>
                  <p className="text-sm text-slate-700">{previewData.company_size}</p>
                </div>
              )}

              {previewData.website && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Website</p>
                  <a
                    href={previewData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-600 hover:text-brand-700 hover:underline"
                  >
                    {previewData.website}
                  </a>
                </div>
              )}
            </div>

            {/* Description */}
            {previewData.description && (
              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs font-medium text-slate-500 mb-2">About</p>
                <p className="text-sm text-slate-700 leading-relaxed line-clamp-4">
                  {previewData.description}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Button */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <button
              onClick={handleConfirm}
              className="w-full bg-brand-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-brand-700 transition-colors flex items-center justify-center"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Confirm & Continue
            </button>
          </div>
        </div>
      )}

      {/* Help Text */}
      {!previewData && !isLoading && (
        <div className="text-center py-8">
          <Linkedin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">
            Enter your company's LinkedIn URL above to automatically import company details
          </p>
        </div>
      )}
    </div>
  );
};

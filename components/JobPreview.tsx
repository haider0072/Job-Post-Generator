import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, FileText } from 'lucide-react';

interface JobPreviewProps {
  content: string | null;
  isLoading: boolean;
}

export const JobPreview: React.FC<JobPreviewProps> = ({ content, isLoading }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col items-center justify-center text-center space-y-4">
         <div className="relative">
            <div className="w-16 h-16 border-4 border-brand-100 border-t-brand-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <FileText className="w-6 h-6 text-brand-500 opacity-50" />
            </div>
         </div>
         <div>
            <h3 className="text-lg font-medium text-gray-900">Crafting your job post...</h3>
            <p className="text-gray-500 text-sm mt-1">Analyzing requirements, optimizing for tone, and formatting.</p>
         </div>
         {/* Animated skeleton lines */}
         <div className="w-full max-w-sm space-y-2 pt-6 opacity-60">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse delay-75"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto animate-pulse delay-150"></div>
         </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="h-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col items-center justify-center text-center border-dashed border-2">
        <div className="bg-gray-50 p-4 rounded-full mb-4">
          <FileText className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No Job Post Yet</h3>
        <p className="text-gray-500 max-w-xs mx-auto mt-2">
          Fill out the form on the left to generate a professional job description instantly.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden relative group">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Preview</h3>
        <button
          onClick={handleCopy}
          className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            copied
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 mr-1.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              Copy to Clipboard
            </>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 min-h-0" style={{wordBreak: 'break-word', overflowWrap: 'anywhere'}}>
        <article className="w-full max-w-full" style={{wordBreak: 'break-word', overflowWrap: 'anywhere'}}>
          <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                  h1: ({...props}) => <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4" style={{wordBreak: 'break-word', overflowWrap: 'anywhere'}} {...props} />,
                  h2: ({...props}) => <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4" style={{wordBreak: 'break-word', overflowWrap: 'anywhere'}} {...props} />,
                  h3: ({...props}) => <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3" style={{wordBreak: 'break-word', overflowWrap: 'anywhere'}} {...props} />,
                  ul: ({...props}) => <ul className="list-disc list-outside ml-6 space-y-2 mb-4" style={{wordBreak: 'break-word', overflowWrap: 'anywhere'}} {...props} />,
                  ol: ({...props}) => <ol className="list-decimal list-outside ml-6 space-y-2 mb-4" style={{wordBreak: 'break-word', overflowWrap: 'anywhere'}} {...props} />,
                  li: ({...props}) => <li className="text-gray-700 pl-2" style={{wordBreak: 'break-word', overflowWrap: 'anywhere'}} {...props} />,
                  p: ({...props}) => <p className="text-gray-600 leading-relaxed mb-4" style={{wordBreak: 'break-word', overflowWrap: 'anywhere'}} {...props} />,
                  strong: ({...props}) => <strong className="font-semibold text-gray-900" {...props} />,
                  em: ({...props}) => <em className="italic" {...props} />,
                  code: ({...props}) => <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800" style={{wordBreak: 'break-all', overflowWrap: 'anywhere'}} {...props} />,
                  a: ({...props}) => <a className="text-brand-600 hover:text-brand-700 underline" style={{wordBreak: 'break-word', overflowWrap: 'anywhere'}} {...props} />,
              }}
          >
            {content}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
};

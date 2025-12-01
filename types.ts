export interface JobPostRequest {
  prompt: string;
}

export interface GeneratedJobPost {
  content: string;
  timestamp: number;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey(): Promise<boolean>;
    openSelectKey(): Promise<void>;
  }
}

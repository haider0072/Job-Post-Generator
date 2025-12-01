export interface JobPostRequest {
  prompt: string;
}

export interface GeneratedJobPost {
  content: string;
  timestamp: number;
}

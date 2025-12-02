import { JobPostRequest } from "../types";

// Use relative URL for production (Vercel), absolute URL for local dev
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (
  import.meta.env.DEV ? 'http://localhost:3001' : ''
);

// Clean markdown code blocks from response
const cleanMarkdown = (text: string): string => {
  // Remove ```markdown and ``` from the beginning and end
  let cleaned = text.trim();

  // Remove opening ```markdown, ```md, or just ```
  cleaned = cleaned.replace(/^```(?:markdown|md)?\s*\n/i, '');

  // Remove closing ```
  cleaned = cleaned.replace(/\n```\s*$/, '');

  return cleaned.trim();
};

export const generateJobPost = async (request: JobPostRequest): Promise<string> => {
  if (!request.accessToken) {
    throw new Error("Access token is required");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-job-post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: request.prompt,
        accessToken: request.accessToken,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate job post');
    }

    const data = await response.json();
    const content = data.content || "Failed to generate content. Please try again.";

    // Clean the markdown before returning
    return cleanMarkdown(content);
  } catch (error) {
    console.error("Error generating job post:", error);
    throw error;
  }
};

export const verifyToken = async (accessToken: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/verify-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken }),
    });

    const data = await response.json();
    return data.valid;
  } catch (error) {
    console.error("Error verifying token:", error);
    return false;
  }
};

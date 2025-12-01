import { GoogleGenAI } from "@google/genai";
import { JobPostRequest } from "../types";

const SYSTEM_INSTRUCTION = `
You are an expert HR Recruitment Specialist and Copywriter with over 20 years of experience.
Your goal is to transform a single user prompt (which can be simple or complex) into a high-quality, professional Markdown job description.

**Process:**
1.  **Analyze**: Read the user's prompt to extract explicitly stated details (Job Title, Company, Location, Skills, Tone).
2.  **Infer**: If details are missing, reasonably infer them based on the context or use standard professional defaults (e.g., if no location is given, mark as "Remote/Flexible" or omit; if no tone is given, default to "Professional but engaging").
3.  **Expand**:
    *   If the prompt is **simple** (e.g., "Hiring a React dev"), you MUST expand it into a full job post with standard industry responsibilities, requirements, and benefits for that role.
    *   If the prompt is **complex**, respect the specific constraints and details provided.
4.  **Format**: Return ONLY the Markdown content.

**Standard Structure to Follow (unless prompt implies otherwise):**
*   **H1 Title**
*   **Introduction/Hook**: Why join?
*   **The Role**: Summary of what they will do.
*   **Responsibilities**: Bullet points.
*   **Requirements**: Bullet points.
*   **Benefits**: Bullet points.
*   **How to Apply**
`;

export const generateJobPost = async (request: JobPostRequest): Promise<string> => {
  // Initialize the client inside the function to ensure it captures the API key 
  // after the user has completed the selection flow.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: request.prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7, 
      }
    });

    return response.text || "Failed to generate content. Please try again.";
  } catch (error) {
    console.error("Error generating job post:", error);
    throw error;
  }
};

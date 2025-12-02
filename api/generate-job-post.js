export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, accessToken } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!accessToken) {
      return res.status(401).json({ error: 'API key is required' });
    }

    const systemInstruction = `You are an expert HR Recruitment Specialist and Copywriter with over 20 years of experience.
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
*   **How to Apply**`;

    // Use direct Gemini API with user's API key
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${accessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error('Gemini API error:', errorData);
      return res.status(geminiResponse.status).json({
        error: errorData.error?.message || 'Failed to generate content. Please check your API key.'
      });
    }

    const geminiData = await geminiResponse.json();
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Failed to generate content. Please try again.";

    res.status(200).json({ content: text });
  } catch (error) {
    console.error('Error generating job post:', error);

    res.status(500).json({
      error: 'Failed to generate job post. Please try again.'
    });
  }
}

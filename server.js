import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { supabase } from './lib/supabaseServer.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Generate job post endpoint using direct Gemini API
app.post('/api/generate-job-post', async (req, res) => {
  try {
    const { prompt, accessToken, organizationData } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!accessToken) {
      return res.status(401).json({ error: 'API key is required' });
    }

    // Build enhanced prompt with organization context
    let enhancedPrompt = prompt;

    if (organizationData) {
      const orgContext = [];

      if (organizationData.name) {
        orgContext.push(`Company Name: ${organizationData.name}`);
      }
      if (organizationData.industry) {
        orgContext.push(`Industry: ${organizationData.industry}`);
      }
      if (organizationData.location) {
        orgContext.push(`Location: ${organizationData.location}`);
      }
      if (organizationData.company_size) {
        orgContext.push(`Company Size: ${organizationData.company_size}`);
      }
      if (organizationData.website) {
        orgContext.push(`Website: ${organizationData.website}`);
      }
      if (organizationData.email) {
        orgContext.push(`Contact Email: ${organizationData.email}`);
      }
      if (organizationData.description) {
        orgContext.push(`About the Company: ${organizationData.description}`);
      }

      if (orgContext.length > 0) {
        enhancedPrompt = `${orgContext.join('\n')}\n\n${prompt}`;
      }
    }

    const systemInstruction = `You are an expert HR Recruitment Specialist and Copywriter with over 20 years of experience.
Your goal is to transform a single user prompt (which can be simple or complex) into a high-quality, professional Markdown job description.

**Process:**
1.  **Analyze**: Read the user's prompt to extract explicitly stated details (Job Title, Company, Location, Skills, Tone).
2.  **Use Company Context**: If company information is provided at the start of the prompt, incorporate it naturally into the job post. Make sure to include company name, location, and relevant details where appropriate.
3.  **Infer**: If details are missing, reasonably infer them based on the context or use standard professional defaults (e.g., if no location is given, mark as "Remote/Flexible" or omit; if no tone is given, default to "Professional but engaging").
4.  **Expand**:
    *   If the prompt is **simple** (e.g., "Hiring a React dev"), you MUST expand it into a full job post with standard industry responsibilities, requirements, and benefits for that role.
    *   If the prompt is **complex**, respect the specific constraints and details provided.
5.  **Format**: Return ONLY the Markdown content.

**Standard Structure to Follow (unless prompt implies otherwise):**
*   **H1 Title** (include company name if provided)
*   **About [Company Name]** (if company info provided): Brief description using the provided company details
*   **Introduction/Hook**: Why join?
*   **The Role**: Summary of what they will do.
*   **Responsibilities**: Bullet points.
*   **Requirements**: Bullet points.
*   **Benefits**: Bullet points.
*   **How to Apply** (include company website/email if provided)`;

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
            parts: [{ text: enhancedPrompt }]
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

    res.json({ content: text });
  } catch (error) {
    console.error('Error generating job post:', error);

    res.status(500).json({
      error: 'Failed to generate job post. Please try again.'
    });
  }
});

// Verify API key endpoint (optional - just checks if key is provided)
app.post('/api/verify-token', async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    // Simple validation - just check if key exists
    // Actual validation will happen when generating content
    res.json({ valid: true });
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ valid: false, error: 'Invalid access token' });
  }
});

// =====================================================
// ORGANIZATION ENDPOINTS
// =====================================================

// Get organization by user_id
app.get('/api/organization/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No organization found
        return res.status(404).json({ error: 'Organization not found' });
      }
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
});

// Create or update organization
app.post('/api/organization', async (req, res) => {
  try {
    const { userId, orgData } = req.body;

    if (!userId || !orgData) {
      return res.status(400).json({ error: 'userId and orgData are required' });
    }

    // Upsert (insert or update)
    const { data, error } = await supabase
      .from('organizations')
      .upsert({
        user_id: userId,
        ...orgData,
        last_updated: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error saving organization:', error);
    res.status(500).json({ error: 'Failed to save organization' });
  }
});

// Delete organization
app.delete('/api/organization/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({ error: 'Failed to delete organization' });
  }
});

// =====================================================
// SCRAPINGDOG LINKEDIN SCRAPING ENDPOINT
// =====================================================

// Extract company ID from LinkedIn URL
function extractLinkedInCompanyId(url) {
  try {
    // Remove trailing slash
    url = url.trim().replace(/\/$/, '');

    // Extract company slug from URL
    // Examples:
    // https://www.linkedin.com/company/google/ -> google
    // https://linkedin.com/company/microsoft -> microsoft
    const match = url.match(/linkedin\.com\/company\/([^\/\?]+)/i);

    if (match && match[1]) {
      return match[1];
    }

    throw new Error('Invalid LinkedIn URL format');
  } catch (error) {
    throw new Error('Could not extract company ID from LinkedIn URL');
  }
}

// Scrape LinkedIn company profile
app.post('/api/scrape-linkedin', async (req, res) => {
  try {
    const { linkedinUrl, userId } = req.body;

    if (!linkedinUrl) {
      return res.status(400).json({ error: 'LinkedIn URL is required' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Extract company ID
    const companyId = extractLinkedInCompanyId(linkedinUrl);

    // Call ScrapingDog API
    const scrapingDogResponse = await axios.get('https://api.scrapingdog.com/profile', {
      params: {
        api_key: process.env.SCRAPINGDOG_API_KEY,
        id: companyId,
        type: 'company'
      },
      timeout: 30000 // 30 second timeout
    });

    let linkedinData = scrapingDogResponse.data;

    // ScrapingDog returns an array, get first item
    if (Array.isArray(linkedinData) && linkedinData.length > 0) {
      linkedinData = linkedinData[0];
    }

    // Map LinkedIn data to our organization schema
    const organizationData = {
      name: linkedinData.company_name || linkedinData.name || '',
      description: linkedinData.about || linkedinData.description || '',
      industry: linkedinData.industry || linkedinData.industries?.[0] || '',
      location: linkedinData.location || linkedinData.headquarters || '',
      company_size: linkedinData.company_size_on_linkedin || linkedinData.company_size || '',
      website: linkedinData.website || '',
      logo_url: linkedinData.profile_photo || linkedinData.logo || linkedinData.logo_url || '',
      linkedin_url: linkedinUrl,
      linkedin_data: linkedinData
    };

    // Save to Supabase
    const { data, error } = await supabase
      .from('organizations')
      .upsert({
        user_id: userId,
        ...organizationData,
        last_updated: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      organization: data,
      message: 'LinkedIn data imported successfully'
    });

  } catch (error) {
    console.error('Error scraping LinkedIn:', error);

    if (error.response?.status === 404) {
      return res.status(404).json({
        error: 'Company not found on LinkedIn. Please check the URL.'
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({
        error: 'ScrapingDog API rate limit reached. Please try again later.'
      });
    }

    res.status(500).json({
      error: error.message || 'Failed to scrape LinkedIn data'
    });
  }
});

// =====================================================
// USER PROFILE ENDPOINTS
// =====================================================

// Get user profile
app.get('/api/user-profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Profile not found' });
      }
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Save user profile (API key)
app.post('/api/user-profile', async (req, res) => {
  try {
    const { userId, geminiApiKey } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        gemini_api_key: geminiApiKey,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error saving user profile:', error);
    res.status(500).json({ error: 'Failed to save user profile' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

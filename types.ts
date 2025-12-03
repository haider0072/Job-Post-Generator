export interface JobPostRequest {
  prompt: string;
  accessToken?: string;
  organizationData?: Organization;
}

export interface GeneratedJobPost {
  content: string;
  timestamp: number;
}

export interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  accessToken: string;
}

// Organization related types
export interface Organization {
  id?: string;
  user_id?: string;
  name: string;
  description?: string;
  industry?: string;
  location?: string;
  company_size?: string;
  website?: string;
  email?: string;
  logo_url?: string;
  linkedin_url?: string;
  linkedin_data?: any;
  last_updated?: string;
  created_at?: string;
}

export interface UserProfile {
  id?: string;
  user_id: string;
  gemini_api_key?: string;
  created_at?: string;
  updated_at?: string;
}

export interface JobPost {
  id?: string;
  user_id: string;
  organization_id?: string;
  title: string;
  content: string;
  prompt?: string;
  generated_at?: string;
  created_at?: string;
}

// LinkedIn scraping types
export interface LinkedInCompanyData {
  name?: string;
  description?: string;
  industry?: string;
  location?: string;
  company_size?: string;
  website?: string;
  logo?: string;
  follower_count?: number;
  employee_count?: string;
  specialties?: string[];
  founded?: string;
  company_type?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token: string }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}
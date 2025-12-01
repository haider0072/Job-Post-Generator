export interface JobPostRequest {
  prompt: string;
  accessToken?: string;
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
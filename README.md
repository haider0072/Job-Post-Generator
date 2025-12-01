<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# JobCraft AI - AI-Powered Job Post Generator

Create professional, engaging job posts in seconds using Google's Gemini 2.0 Flash AI. Simply sign in with Google, enter your Gemini API key, and start generating high-quality job descriptions instantly.

## ✨ Features

- **🔐 Google OAuth Authentication**: Secure sign-in with your Google account
- **🔑 Personal API Key**: Use your own Gemini API key for complete control
- **🚀 Gemini 2.0 Flash**: Powered by Google's latest and fastest AI model
- **📝 Smart Job Post Generation**: AI analyzes your input and creates comprehensive job descriptions
- **💎 Beautiful Markdown Output**: Clean, professionally formatted job posts
- **📋 One-Click Copy**: Instantly copy generated content to clipboard
- **🎨 Modern UI**: Responsive design with real-time preview
- **⚡ Fast & Free**: Uses free tier of Gemini API

## 🎯 How It Works

1. **Sign In**: Authenticate with your Google account
2. **API Key**: Enter your Gemini API key (get one free from Google AI Studio)
3. **Describe**: Simply type what job you're hiring for (e.g., "React developer" or detailed requirements)
4. **Generate**: AI creates a complete, professional job post with all sections
5. **Copy & Use**: Preview, edit if needed, and copy to your job board

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS
- **Backend**: Express.js, Node.js
- **AI**: Google Gemini 2.0 Flash API
- **Auth**: Google OAuth 2.0
- **Markdown**: react-markdown with remark-gfm

## 📦 Installation

### Prerequisites

- Node.js v18 or higher
- A Google account
- A Gemini API key (free from [Google AI Studio](https://aistudio.google.com/apikey))

### Setup Steps

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Job-Post-Generator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Google OAuth**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application"
   - Add authorized JavaScript origins: `http://localhost:3000`
   - Add authorized redirect URIs: `http://localhost:3000`
   - Copy your **Client ID**

4. **Set up environment variables**:

   Create `.env.local` file:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   VITE_API_BASE_URL=http://localhost:3001
   ```

   Create `.env` file:
   ```env
   PORT=3001
   CLIENT_URL=http://localhost:3000
   GOOGLE_CLOUD_PROJECT=your-project-id
   ```

5. **Run the application**:
   ```bash
   # Run both frontend and backend
   npm run dev:all
   ```

6. **Open your browser**:
   - Navigate to `http://localhost:3000`
   - Sign in with Google
   - Enter your Gemini API key
   - Start generating job posts!

## 🔑 Getting a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Get API Key"
4. Copy your API key
5. Paste it in JobCraft AI when prompted

**Note**: The Gemini API has a generous free tier with no credit card required!

## 📁 Project Structure

```
Job-Post-Generator/
├── App.tsx                      # Main application with auth flow
├── server.js                    # Express backend API server
├── components/
│   ├── Layout.tsx              # App layout with header & footer
│   ├── JobForm.tsx             # Job description input form
│   └── JobPreview.tsx          # Markdown preview with formatting
├── services/
│   └── geminiService.ts        # Gemini API integration
├── types.ts                    # TypeScript type definitions
├── .env                        # Backend environment variables
└── .env.local                  # Frontend environment variables
```

## 🎨 Features in Detail

### AI-Powered Generation
- **Smart Expansion**: Simple prompts like "software engineer" are expanded into full job posts
- **Structured Output**: Automatically includes all standard sections (Role, Responsibilities, Requirements, Benefits, How to Apply)
- **Professional Tone**: Maintains appropriate language and formatting
- **Customizable**: Provide detailed requirements for more specific results

### Markdown Formatting
- Properly formatted headings and sections
- Bullet points for easy readability
- Professional styling with proper spacing
- Fully responsive layout

### User Experience
- Clean, intuitive interface
- Real-time preview as content is generated
- One-click copy to clipboard
- Error handling with helpful messages
- Responsive design for all screen sizes

## 🔒 Security & Privacy

- **No Data Storage**: API keys stored only in browser localStorage
- **Direct API Calls**: Your API key is sent directly to Google's servers
- **No Server Logging**: Backend doesn't store or log sensitive data
- **User-Owned Quota**: You control your API usage and costs
- **Secure Authentication**: OAuth 2.0 with Google

## 🐛 Troubleshooting

### "Google Client ID is not configured"
- Check that `VITE_GOOGLE_CLIENT_ID` is set in `.env.local`
- Restart the dev server after changing environment variables

### "Invalid API key" error
- Verify your Gemini API key at [Google AI Studio](https://aistudio.google.com/apikey)
- Make sure you're copying the entire key
- Try generating a new API key

### Backend not connecting
- Ensure backend server is running (check terminal for "Server running on http://localhost:3001")
- Verify `VITE_API_BASE_URL` in `.env.local` matches backend port
- Check that both servers are running with `npm run dev:all`

### Quota exceeded
- Free tier has rate limits
- Wait a few minutes before trying again
- Check your usage at [Google AI Studio](https://aistudio.google.com/apikey)

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables:
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_API_BASE_URL` (your backend URL)

### Backend (Railway/Heroku)
1. Deploy `server.js` and dependencies
2. Set environment variables:
   - `PORT`
   - `CLIENT_URL` (your frontend URL)
3. Update CORS settings for production domain

## 📝 Available Scripts

- `npm run dev` - Start frontend development server
- `npm run dev:server` - Start backend server
- `npm run dev:all` - Run both frontend and backend
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Built with [Google Gemini 2.0 Flash](https://deepmind.google/technologies/gemini/)
- UI components styled with [TailwindCSS](https://tailwindcss.com/)
- Icons from [Lucide React](https://lucide.dev/)

---

**Made with ❤️ using Google Gemini AI**

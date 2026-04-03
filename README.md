# AI Smart Email Sender & Assistant

A production-ready full-stack web application combining a Perplexity-style AI chat interface with a Smart Email Sender feature. 

It leverages Node.js, Express, MongoDB, and React (Vite) + Zustand. For its AI features, it uses LangChain, Tavily API (for real-time research), and Nodemailer (for SMTP email sending).

## Features

- **Smart Email Generation**: Uses an LLM to analyze intent. If you command it to "send an email to [X] about [Y]", it performs a deep web search via Tavily, writes professional HTML content, and sends it directly.
- **Context-Aware AI Chat**: Markdown-supported rich text responses from the AI.
- **Chat History**: Persists conversations, separated into isolated sessions.
- **Authentication**: JWT-based secure signup/login.
- **Premium UI**: Built with SCSS, dark-mode, and glassmorphic micro-interactions inspired by linear/perplexity.

## Tech Stack

- **Frontend**: React, Vite, Zustand, SCSS, React Router, Lucide Icons, Framer Motion
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, Nodemailer
- **AI / Tools**: LangChain, OpenAI API / Google Gemini API, Tavily Core API

## Prerequisites

- Node.js (v18+)
- MongoDB (running locally or a Mongo Atlas string)
- API Keys: OpenAI/Gemini, Tavily
- App Password: For your chosen Email Provider (e.g., Gmail App Password)

## Setup Instructions

### 1. Backend Setup

1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Open the `.env` file and replace the placeholder values with your actual keys:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `OPENAI_API_KEY` (or `GEMINI_API_KEY`)
   - `TAVILY_API_KEY`
   - `EMAIL_USER` (e.g., your_email@gmail.com)
   - `EMAIL_PASS` (e.g., your 16-character Gmail App Password)

4. Start the server (Dev Mode):
   ```bash
   npm run dev
   ```
   *(Runs on http://localhost:5000)*

### 2. Frontend Setup

1. Navigate to the `Frontend` directory from the root:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
   *(Runs on http://localhost:5173)*

## Testing the Smart Email Feature

1. Register for an account.
2. In the chat, type exactly this: 
   > *"Send an email to [your-test-email@gmail.com] about the latest advancements in AI agents"*
3. The AI will parse the intent, use Tavily to find the latest info on AI agents, write the email, send it, and confirm with you in the chat interface!

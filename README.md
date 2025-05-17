# NPTEL Quiz App

A minimal JSON-driven quiz application built with React, TypeScript, and Express.

## Features

- Sequential assignment unlocking
- Progress tracking with localStorage
- Clean and responsive UI with Tailwind CSS
- TypeScript for type safety
- Express backend with JSON file storage

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

This will start both the frontend (Vite) and backend (Express) servers concurrently.

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Project Structure

```
.
├── data/
│   └── assignments/     # JSON files for quiz content
├── src/
│   ├── components/      # React components
│   ├── hooks/          # Custom React hooks
│   ├── server/         # Express backend
│   ├── types.ts        # TypeScript type definitions
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── index.html          # HTML entry point
├── package.json        # Project dependencies
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite configuration
```

## API Endpoints

- `GET /api/assignments` - List all assignments
- `GET /api/assignments/:id` - Get assignment details
- `POST /api/assignments/:id/submit` - Submit quiz answers

## Adding New Assignments

Create a new JSON file in `data/assignments/` following this schema:

```json
{
  "id": "assignment_id",
  "title": "Assignment Title",
  "questions": [
    {
      "id": "question_id",
      "text": "Question text",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": "Correct option"
    }
  ]
}
``` 
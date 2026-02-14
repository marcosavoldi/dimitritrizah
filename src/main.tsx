import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext'

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
console.log("Firebase Config Status:", {
  apiKeyPresent: !!apiKey,
  apiKeyLength: apiKey ? apiKey.length : 0,
  mode: import.meta.env.MODE
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)

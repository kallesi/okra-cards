import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeContextProvider } from './context/ThemeContextProvider'

createRoot(document.getElementById('root')!).render(
 <StrictMode>
    <ThemeContextProvider>
      <App />
    </ThemeContextProvider>
  </StrictMode>,
)

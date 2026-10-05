import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { StudentAuthProvider } from './contexts/StudentAuthContext'
import { ToastProvider } from './components/ui/Toast'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <StudentAuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </StudentAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)

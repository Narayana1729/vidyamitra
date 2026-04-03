import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// Global interceptor to catch 401 Authorization errors (Expired Tokens)
// Only clears tokens; AuthContext handles the redirect gracefully.
let isLoggingOut = false;
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (localStorage.getItem('vm_token') && !isLoggingOut) {
        isLoggingOut = true;
        console.warn("Token expired — clearing session.");
        localStorage.removeItem('vm_token');
        localStorage.removeItem('vm_refresh');
        // Let AuthContext detect the missing token and redirect via React Router
        // instead of forcing a full page reload with window.location.href
        setTimeout(() => { isLoggingOut = false; }, 2000);
      }
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// Global interceptor to catch 401 Authorization errors (Expired Tokens)
// and gracefully force a logout across the entire application.
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (localStorage.getItem('vm_token')) {
        console.warn("Token expired! Forcing logout.");
        localStorage.removeItem('vm_token');
        localStorage.removeItem('vm_refresh');
        window.location.href = '/login';
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

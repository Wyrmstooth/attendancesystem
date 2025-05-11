import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // Make sure this import is at the top
import axios from 'axios'

// Set up axios defaults
axios.defaults.baseURL = '/api'
axios.defaults.headers.common['Content-Type'] = 'application/json'

// Add token to requests if available
const token = localStorage.getItem('token')
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

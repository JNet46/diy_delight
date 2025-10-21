import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { SavedCarsProvider } from './context/SavedCarsContext'
import App from './App'
import './index.css'
import 'picocss/pico.min.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SavedCarsProvider>
      <App />
      </SavedCarsProvider>
    </BrowserRouter>
  </React.StrictMode>
)
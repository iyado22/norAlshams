import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { getCLS } from 'web-vitals/getCLS'
import { getFID } from 'web-vitals/getFID'
import { getFCP } from 'web-vitals/getFCP'
import { getLCP } from 'web-vitals/getLCP'
import { getTTFB } from 'web-vitals/getTTFB'
import './index.css'
import App from './App.jsx'

// Performance monitoring
function sendToAnalytics(metric) {
  // In production, send to your analytics service
  console.log('Web Vital:', metric);
}

// Measure Core Web Vitals
getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

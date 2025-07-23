import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { getCLS } from 'web-vitals/lib/getCLS'
import { getFID } from 'web-vitals/lib/getFID'
import { getFCP } from 'web-vitals/lib/getFCP'
import { getLCP } from 'web-vitals/lib/getLCP'
import { getTTFB } from 'web-vitals/lib/getTTFB'
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

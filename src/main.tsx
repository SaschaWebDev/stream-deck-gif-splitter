import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

const Design1 = lazy(() => import('./designs/Design1NeonArcade.tsx'))
const Design2 = lazy(() => import('./designs/Design2GlassMorphism.tsx'))
const Design3 = lazy(() => import('./designs/Design3Cyberpunk.tsx'))
const Design4 = lazy(() => import('./designs/Design4MinimalZen.tsx'))
const Design5 = lazy(() => import('./designs/Design5Hardware.tsx'))

const Loading = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#08080a', color: '#e8e8ec', fontFamily: 'system-ui' }}>
    Loading...
  </div>
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/1" element={<Design1 />} />
          <Route path="/2" element={<Design2 />} />
          <Route path="/3" element={<Design3 />} />
          <Route path="/4" element={<Design4 />} />
          <Route path="/5" element={<Design5 />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)

import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Onboarding from './pages/Onboarding'
import Sample from './pages/Sample'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen bg-void text-text-primary font-sans">
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/sample" element={<Sample />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

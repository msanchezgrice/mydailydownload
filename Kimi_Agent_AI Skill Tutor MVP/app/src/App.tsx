import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Onboarding from './pages/Onboarding'
import Sample from './pages/Sample'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen bg-void text-text-primary font-sans">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/sample" element={<Sample />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

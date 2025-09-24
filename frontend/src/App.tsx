import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import BottomBar from './components/BottomBar'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ExplorePage from './pages/ExplorePage'
import ServicePage from './pages/ServicePage'
import ServicesPage from './pages/ServicesPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Routes>
          <Route path="/" element={
            <>
              <Navbar />
              <HomePage />
              <BottomBar />
            </>
          } />
          <Route path="/explore" element={
            <>
              <Navbar />
              <ExplorePage />
              <BottomBar />
            </>
          } />
          <Route path="/services" element={
            <>
              <Navbar />
              <ServicesPage />
              <BottomBar />
            </>
          } />
          <Route path="/services/:serviceName" element={
            <>
              <Navbar />
              <ServicePage />
              <BottomBar />
            </>
          } />
          <Route path="/login" element={
            <>
              <LoginPage />
              <BottomBar />
            </>
          } />
          <Route path="/privacy-policy" element={
            <>
              <Navbar />
              <PrivacyPolicyPage />
              <BottomBar />
            </>
          } />
          <Route path="/terms-of-service" element={
            <>
              <Navbar />
              <TermsOfServicePage />
              <BottomBar />
            </>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App

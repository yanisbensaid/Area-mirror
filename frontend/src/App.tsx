import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ServiceProvider } from './contexts/ServiceContext'
import { ServicesPageProvider } from './contexts/ServicesPageContext'
import { EditServiceProvider } from './contexts/EditServiceContext'
import Navbar from './components/Navbar'
import BottomBar from './components/BottomBar'
import HomePage from './pages/home/HomePage'
import LoginPage from './pages/auth/LoginPage'
import ExplorePage from './pages/home/ExplorePage'
import ServicePage from './pages/services/ServicePage'
import ServicesPage from './pages/services/ServicesPage'
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage'
import TermsOfServicePage from './pages/legal/TermsOfServicePage'
import CookiePolicyPage from './pages/legal/CookiePolicyPage'
import AboutUsPage from './pages/home/AboutUsPage'
import DashboardPage from './pages/home/DashboardPage'
import CreateServicePage from './pages/services/CreateServicePage'
import EditService from './pages/services/EditService'
import CreateAutomation from './pages/automations/CreateAutomation'
import AddAction from './pages/services/AddAction'
import AddReaction from './pages/services/AddReaction'
import EditActions from './pages/services/EditActions'
import EditReactions from './pages/services/EditReactions'
import ManageAutomations from './pages/automations/ManageAutomations'
import AREATemplatesPage from './pages/automations/AREATemplatesPage'
import YouTubeTelegramAreaPage from './pages/services/YouTubeTelegramAreaPage'

function App() {
  return (
    <AuthProvider>
      <ServiceProvider>
        <ServicesPageProvider>
          <EditServiceProvider>
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
          <Route path="/area/:areaId" element={
            <>
              <Navbar />
              <YouTubeTelegramAreaPage />
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
          <Route path="/editService/:serviceId" element={
            <>
              <Navbar />
              <EditService />
              <BottomBar />
            </>
          } />
          <Route path="/addActions/:serviceId" element={
            <>
              <Navbar />
              <AddAction />
              <BottomBar />
            </>
          } />
          <Route path="/addReactions/:serviceId" element={
            <>
              <Navbar />
              <AddReaction />
              <BottomBar />
            </>
          } />
          <Route path="/editActions/:serviceId" element={
            <>
              <Navbar />
              <EditActions />
              <BottomBar />
            </>
          } />
          <Route path="/editReactions/:serviceId" element={
            <>
              <Navbar />
              <EditReactions />
              <BottomBar />
            </>
          } />
          <Route path="/createAutomation/:serviceId?" element={
            <>
              <Navbar />
              <CreateAutomation />
              <BottomBar />
            </>
          } />
          <Route path="/manageAutomations/:serviceId" element={
            <>
              <Navbar />
              <ManageAutomations />
              <BottomBar />
            </>
          } />
          <Route path="/area-templates" element={
            <>
              <Navbar />
              <AREATemplatesPage />
              <BottomBar />
            </>
          } />
          <Route path="/dashboard" element={
            <>
              <Navbar />
              <DashboardPage />
              <BottomBar />
            </>
          } />
          <Route path="/createService" element={
            <>
              <Navbar />
              <CreateServicePage />
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
          <Route path="/cookie-policy" element={
            <>
              <Navbar />
              <CookiePolicyPage />
              <BottomBar />
            </>
          } />
          <Route path="/about-us" element={
            <>
              <Navbar />
              <AboutUsPage />
              <BottomBar />
            </>
          } />
        </Routes>
        </div>
      </Router>
          </EditServiceProvider>
        </ServicesPageProvider>
      </ServiceProvider>
    </AuthProvider>
  )
}

export default App

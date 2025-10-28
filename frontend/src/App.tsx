import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ServiceProvider } from './contexts/ServiceContext'
import { ServicesPageProvider } from './contexts/ServicesPageContext'
import { EditServiceProvider } from './contexts/EditServiceContext'
import { EditActionsProvider } from './contexts/EditActionsContext'
import Navbar from './components/Navbar'
import BottomBar from './components/BottomBar'
import HomePage from './pages/home/HomePage'
import { LoginPage, OAuthCallbackPage } from './pages/auth'
import ExplorePage from './pages/home/ExplorePage'
import OAuthSuccess from './pages/OAuthSuccess'

import ServicesPage from './pages/services/ServicesPage'
import ServiceDetailPage from './pages/services/ServiceDetailPage'
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage'
import TermsOfServicePage from './pages/legal/TermsOfServicePage'
import CookiePolicyPage from './pages/legal/CookiePolicyPage'
import AboutUsPage from './pages/home/AboutUsPage'
import DashboardPage from './pages/home/DashboardPage'
import CreateServicePage from './pages/services/CreateServicePage'
import EditService from './pages/services/EditService'
import EditActions from './pages/services/EditActionPage'
import CreateAutomation from './pages/automations/CreateAutomation'
import AddAction from './pages/services/AddAction'
import AddReaction from './pages/services/AddReaction'
import EditReactions from './pages/services/EditReactionPage'
import ManageAutomations from './pages/automations/ManageAutomations'
import AREATemplatesPage from './pages/automations/AREATemplatesPage'
import YouTubeTelegramAreaPage from './pages/services/YouTubeTelegramAreaPage'
import TwitchTelegramAreaPage from './pages/services/TwitchTelegramAreaPage'
import GmailTelegramAreaPage from './pages/services/GmailTelegramAreaPage'
import YouTubeGmailAreaPage from './pages/services/YouTubeGmailAreaPage'
import SteamTelegramAreaPage from './pages/services/SteamTelegramAreaPage'
import YouTubeDiscordAreaPage from './pages/services/YouTubeDiscordAreaPage'
import CustomAreaDetailPage from './pages/services/CustomAreaDetailPage'
import { EditReactionsProvider } from './contexts/EditReactionsContext'

function App() {
  return (
    <AuthProvider>
      <ServiceProvider>
        <ServicesPageProvider>
          <EditServiceProvider>
            <EditActionsProvider>
              <EditReactionsProvider>
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
          <Route path="/area/youtube_to_telegram" element={
            <>
              <Navbar />
              <YouTubeTelegramAreaPage />
              <BottomBar />
            </>
          } />
          <Route path="/area/twitch_to_telegram" element={
            <>
              <Navbar />
              <TwitchTelegramAreaPage />
              <BottomBar />
            </>
          } />
          <Route path="/area/gmail_to_telegram" element={
            <>
              <Navbar />
              <GmailTelegramAreaPage />
              <BottomBar />
            </>
          } />
          <Route path="/area/youtube_to_gmail" element={
            <>
              <Navbar />
              <YouTubeGmailAreaPage />
              <BottomBar />
            </>
          } />
          <Route path="/area/steam_to_telegram" element={
            <>
              <Navbar />
              <SteamTelegramAreaPage />
              <BottomBar />
            </>
          } />
          <Route path="/area/youtube_to_discord" element={
            <>
              <Navbar />
              <YouTubeDiscordAreaPage />
              <BottomBar />
            </>
          } />
          <Route path="/area/custom/:id" element={
            <>
              <Navbar />
              <CustomAreaDetailPage />
              <BottomBar />
            </>
          } />
          <Route path="/services/:serviceName" element={
            <>
              <Navbar />
              <ServiceDetailPage />
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
          <Route path="/create-automation" element={
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
          <Route path="/oauth/callback" element={
            <>
              <OAuthCallbackPage />
            </>
          } />
          <Route path="/oauth-success" element={
            <>
              <OAuthSuccess />
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
              </EditReactionsProvider>
            </EditActionsProvider>
          </EditServiceProvider>
        </ServicesPageProvider>
      </ServiceProvider>
    </AuthProvider>
  )
}

export default App

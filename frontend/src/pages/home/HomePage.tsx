import AutomationExamples from '../../components/AutomationExamples'
import { Link } from 'react-router-dom'

export default function HomePage() {
  const services = [
    { name: 'Mail', logo: '/app_logo/mail.png', path: '/services/mail' },
    { name: 'Spotify', logo: '/app_logo/spotify.png', path: '/services/spotify' },
    { name: 'Steam', logo: '/app_logo/steam.png', path: '/services/steam' },
    { name: 'Telegram', logo: '/app_logo/telegram.png', path: '/services/telegram' },
    { name: 'Twitch', logo: '/app_logo/twitch.png', path: '/services/twitch' },
    { name: 'YouTube', logo: '/app_logo/youtube.png', path: '/services/youtube' }
  ]
  return (
    <main className="pt-16 md:pt-20 px-4 bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center space-y-6 md:space-y-8 max-w-4xl mx-auto px-4">
          <div className="space-y-4 md:space-y-6">
            <h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold text-gray-900"
              style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.2' }}
            >
              Welcome to{' '}
              <span className="text-gray-600">
                AREA
              </span>
            </h1>
            <p 
              className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
            >
              Connect your apps and automate your workflows with powerful automation tools
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-12 md:mt-16">
            <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-900 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 
                className="text-lg md:text-xl font-medium text-gray-900 mb-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Automate
              </h3>
              <p 
                className="text-gray-600 text-sm md:text-base"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
              >
                Create powerful automations between your favorite apps and services
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-900 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 
                className="text-lg md:text-xl font-medium text-gray-900 mb-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Connect
              </h3>
              <p 
                className="text-gray-600 text-sm md:text-base"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
              >
                Seamlessly integrate hundreds of apps and services
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-900 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 
                className="text-lg md:text-xl font-medium text-gray-900 mb-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Optimize
              </h3>
              <p 
                className="text-gray-600 text-sm md:text-base"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
              >
                Monitor and optimize your workflows for maximum efficiency
              </p>
            </div>
          </div>

          {/* Services Logos Section */}
          <div className="mt-12 md:mt-16 pt-8 md:pt-12 border-t border-gray-200">
            <h3 
              className="text-xl md:text-2xl font-medium text-gray-900 text-center mb-6 md:mb-8"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Available Services
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
              {services.map((service) => (
                <Link
                  key={service.name}
                  to={service.path}
                  className="group flex flex-col items-center p-3 md:p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer"
                >
                  <div className="w-8 h-8 md:w-12 md:h-12 mb-2 md:mb-3 transition-transform duration-200 group-hover:scale-110">
                    <img 
                      src={service.logo} 
                      alt={`${service.name} logo`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span 
                    className="text-xs md:text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200 text-center"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {service.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

        {/* Scroll Indicator Arrow */}
        <div className="flex justify-center mt-8 md:mt-12">
          <div className="animate-bounce">
            <svg 
              className="w-6 h-6 md:w-8 md:h-8 text-gray-400 hover:text-gray-600 transition-colors duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 14l-7 7m0 0l-7-7" 
              />
            </svg>
          </div>
        </div>
        </div>
      </div>

      {/* Automation Examples Section */}
      <div id="automation-examples">
        <AutomationExamples />
      </div>
    </main>
  )
}
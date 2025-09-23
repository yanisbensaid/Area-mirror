import { useParams, Link } from 'react-router-dom'

interface ServiceInfo {
  name: string
  logo: string
  description: string
  color: string
}

const serviceData: Record<string, ServiceInfo> = {
  mail: {
    name: 'Mail',
    logo: '/app_logo/mail.png',
    description: 'Automate your email workflows with triggers and actions for incoming emails, sending notifications, and managing your inbox.',
    color: 'from-blue-500 to-blue-600'
  },
  spotify: {
    name: 'Spotify',
    logo: '/app_logo/spotify.png',
    description: 'Connect your music experience with automation for playlists, liked songs, new releases, and music recommendations.',
    color: 'from-green-500 to-green-600'
  },
  steam: {
    name: 'Steam',
    logo: '/app_logo/steam.png',
    description: 'Automate your gaming experience with notifications for game updates, friend activities, and achievement unlocks.',
    color: 'from-gray-600 to-gray-700'
  },
  telegram: {
    name: 'Telegram',
    logo: '/app_logo/telegram.png',
    description: 'Set up automated messaging, channel notifications, and bot interactions for seamless communication.',
    color: 'from-blue-400 to-blue-500'
  },
  twitch: {
    name: 'Twitch',
    logo: '/app_logo/twitch.png',
    description: 'Automate your streaming workflow with notifications for new followers, stream alerts, and chat moderation.',
    color: 'from-purple-500 to-purple-600'
  },
  youtube: {
    name: 'YouTube',
    logo: '/app_logo/youtube.png',
    description: 'Connect your YouTube channel with automation for new uploads, subscriber milestones, and comment management.',
    color: 'from-red-500 to-red-600'
  }
}

export default function ServicePage() {
  const { serviceName } = useParams<{ serviceName: string }>()
  
  if (!serviceName || !serviceData[serviceName]) {
    return (
      <main className="pt-20 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto py-12 text-center">
          <h1 className="text-4xl font-semibold text-gray-900 mb-4">Service Not Found</h1>
          <Link to="/" className="text-gray-600 hover:text-gray-800">← Back to Home</Link>
        </div>
      </main>
    )
  }

  const service = serviceData[serviceName]

  return (
    <main className="pt-20 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto py-12">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200 mb-6"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 flex-shrink-0">
              <img 
                src={service.logo} 
                alt={`${service.name} logo`}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 
                className="text-4xl font-semibold text-gray-900 mb-2"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.2' }}
              >
                {service.name} Services
              </h1>
              <p 
                className="text-xl text-gray-600 max-w-3xl"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
              >
                {service.description}
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 
            className="text-2xl font-medium text-gray-900 mb-2"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Services Coming Soon
          </h2>
          <p 
            className="text-gray-600 mb-6 max-w-2xl mx-auto"
            style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
          >
            We're working hard to bring you powerful automation tools for {service.name}. 
            Stay tuned for triggers, actions, and integrations that will supercharge your workflow.
          </p>
          
          {/* Placeholder for future services */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 
                className="text-lg font-medium text-gray-900 mb-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Triggers
              </h3>
              <p 
                className="text-sm text-gray-600"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.4' }}
              >
                Detect events and changes in your {service.name} account
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 
                className="text-lg font-medium text-gray-900 mb-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Actions
              </h3>
              <p 
                className="text-sm text-gray-600"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.4' }}
              >
                Perform automated actions on your {service.name} account
              </p>
            </div>
          </div>
          
          <div className="mt-8">
            <Link
              to="/explore"
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 inline-block"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Explore Other Services
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
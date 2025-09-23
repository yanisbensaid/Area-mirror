import { Link } from 'react-router-dom'

interface AutomationExample {
  id: number;
  title: string;
  description: string;
  services: {
    trigger: { name: string; icon: string; color: string };
    action: { name: string; icon: string; color: string };
  };
  popularity: number;
}

const automationExamples: AutomationExample[] = [
  {
    id: 1,
    title: "Auto-save Gmail attachments to Google Drive",
    description: "Automatically save all email attachments from Gmail to a specific Google Drive folder",
    services: {
      trigger: { name: "Gmail", icon: "📧", color: "from-red-500 to-red-600" },
      action: { name: "Google Drive", icon: "💾", color: "from-blue-500 to-blue-600" }
    },
    popularity: 95
  },
  {
    id: 2,
    title: "Slack notifications for GitHub commits",
    description: "Get instant Slack notifications whenever someone pushes to your main repository branch",
    services: {
      trigger: { name: "GitHub", icon: "🐙", color: "from-gray-600 to-gray-700" },
      action: { name: "Slack", icon: "💬", color: "from-purple-500 to-purple-600" }
    },
    popularity: 88
  },
  {
    id: 3,
    title: "Weather alerts to calendar",
    description: "Add weather warnings and alerts as calendar events to help you plan your day",
    services: {
      trigger: { name: "Weather API", icon: "🌤️", color: "from-yellow-500 to-orange-500" },
      action: { name: "Google Calendar", icon: "📅", color: "from-green-500 to-green-600" }
    },
    popularity: 76
  }
];

export default function AutomationExamples() {
  return (
    <div className="mt-20 max-w-6xl mx-auto px-4 py-16 bg-white">
      <div className="text-center mb-12">
        <h2 
          className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4"
          style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.2' }}
        >
          Popular Automations
        </h2>
        <p 
          className="text-xl text-gray-600 max-w-2xl mx-auto"
          style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
        >
          Discover what others are building with AREA
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {automationExamples.map((example) => (
          <div
            key={example.id}
            className="group bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:transform hover:scale-105 cursor-pointer"
          >
            {/* Popularity badge */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span 
                  className="text-sm text-gray-600 font-medium"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {example.popularity}% use this
                </span>
              </div>
              <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            {/* Services flow */}
            <div className="flex items-center justify-between mb-6">
              {/* Trigger service */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-2xl mb-2 shadow-sm">
                  {example.services.trigger.icon}
                </div>
                <span 
                  className="text-sm text-gray-600 text-center"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {example.services.trigger.name}
                </span>
              </div>

              {/* Arrow */}
              <div className="flex-1 flex items-center justify-center mx-4">
                <svg className="w-8 h-8 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>

              {/* Action service */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-2xl mb-2 shadow-sm">
                  {example.services.action.icon}
                </div>
                <span 
                  className="text-sm text-gray-600 text-center"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {example.services.action.name}
                </span>
              </div>
            </div>

            {/* Content */}
            <div>
              <h3 
                className="text-lg font-medium text-gray-900 mb-2 group-hover:text-gray-700 transition-colors duration-300"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {example.title}
              </h3>
              <p 
                className="text-gray-600 text-sm leading-relaxed"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.4' }}
              >
                {example.description}
              </p>
            </div>

            {/* Action button */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button 
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-900 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 border border-gray-200 hover:border-gray-300"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Use this automation
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Call to action */}
      <div className="text-center mt-12">
        <Link 
          to="/explore"
          className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-sm inline-block"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Explore All
        </Link>
      </div>
    </div>
  );
}
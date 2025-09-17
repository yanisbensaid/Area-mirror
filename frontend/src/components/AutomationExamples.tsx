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
    <div className="mt-20 max-w-6xl mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Popular Automations
        </h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Discover what others are building with AREA
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {automationExamples.map((example) => (
          <div
            key={example.id}
            className="group bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer"
          >
            {/* Popularity badge */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400 font-medium">
                  {example.popularity}% use this
                </span>
              </div>
              <button className="text-gray-400 hover:text-white transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            {/* Services flow */}
            <div className="flex items-center justify-between mb-6">
              {/* Trigger service */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${example.services.trigger.color} flex items-center justify-center text-2xl mb-2 shadow-lg`}>
                  {example.services.trigger.icon}
                </div>
                <span className="text-sm text-gray-300 text-center">
                  {example.services.trigger.name}
                </span>
              </div>

              {/* Arrow */}
              <div className="flex-1 flex items-center justify-center mx-4">
                <svg className="w-8 h-8 text-gray-500 group-hover:text-blue-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>

              {/* Action service */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${example.services.action.color} flex items-center justify-center text-2xl mb-2 shadow-lg`}>
                  {example.services.action.icon}
                </div>
                <span className="text-sm text-gray-300 text-center">
                  {example.services.action.name}
                </span>
              </div>
            </div>

            {/* Content */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300">
                {example.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {example.description}
              </p>
            </div>

            {/* Action button */}
            <div className="mt-6 pt-4 border-t border-slate-700">
              <button className="w-full bg-slate-700/50 hover:bg-slate-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 group-hover:bg-blue-600/20 group-hover:text-blue-400">
                Use this automation
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Call to action */}
      <div className="text-center mt-12">
        <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg">
          Browse All Automations
        </button>
      </div>
    </div>
  );
}
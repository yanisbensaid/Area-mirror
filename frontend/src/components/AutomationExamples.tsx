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
  category: string;
  tags: string[];
}

const automationExamples: AutomationExample[] = [
  {
    id: 1,
    title: "Spotify to YouTube Music Sync",
    description: "Automatically add liked songs from Spotify to your YouTube Music library",
    services: {
      trigger: { name: "Spotify", icon: "/app_logo/spotify.png", color: "bg-green-500" },
      action: { name: "YouTube", icon: "/app_logo/youtube.png", color: "bg-red-500" }
    },
    popularity: 92,
    category: "Music",
    tags: ["music", "sync", "playlist"]
  },
  {
    id: 2,
    title: "Steam Game Launch Notifications",
    description: "Get Telegram notifications when your friends start playing games on Steam",
    services: {
      trigger: { name: "Steam", icon: "/app_logo/steam.png", color: "bg-gray-700" },
      action: { name: "Telegram", icon: "/app_logo/telegram.png", color: "bg-blue-500" }
    },
    popularity: 84,
    category: "Gaming",
    tags: ["gaming", "notifications", "friends"]
  },
  {
    id: 3,
    title: "Email to Telegram Alerts",
    description: "Forward important emails to your Telegram chat for instant notifications",
    services: {
      trigger: { name: "Mail", icon: "/app_logo/mail.png", color: "bg-blue-600" },
      action: { name: "Telegram", icon: "/app_logo/telegram.png", color: "bg-blue-500" }
    },
    popularity: 89,
    category: "Communication",
    tags: ["email", "notifications", "alerts"]
  },
  {
    id: 4,
    title: "Twitch Stream to YouTube Upload",
    description: "Automatically upload your Twitch stream recordings to YouTube",
    services: {
      trigger: { name: "Twitch", icon: "/app_logo/twitch.png", color: "bg-purple-600" },
      action: { name: "YouTube", icon: "/app_logo/youtube.png", color: "bg-red-500" }
    },
    popularity: 76,
    category: "Content Creation",
    tags: ["streaming", "content", "upload"]
  },
  {
    id: 5,
    title: "YouTube Upload to Telegram Channel",
    description: "Post new YouTube videos to your Telegram channel automatically",
    services: {
      trigger: { name: "YouTube", icon: "/app_logo/youtube.png", color: "bg-red-500" },
      action: { name: "Telegram", icon: "/app_logo/telegram.png", color: "bg-blue-500" }
    },
    popularity: 81,
    category: "Content Creation",
    tags: ["youtube", "telegram", "promotion"]
  },
  {
    id: 6,
    title: "Spotify Playlist to Mail Digest",
    description: "Send weekly email summaries of your most played Spotify tracks",
    services: {
      trigger: { name: "Spotify", icon: "/app_logo/spotify.png", color: "bg-green-500" },
      action: { name: "Mail", icon: "/app_logo/mail.png", color: "bg-blue-600" }
    },
    popularity: 67,
    category: "Music",
    tags: ["music", "weekly", "digest"]
  },
  {
    id: 7,
    title: "Steam Achievement to Twitch Chat",
    description: "Announce your Steam achievements in your Twitch chat stream",
    services: {
      trigger: { name: "Steam", icon: "/app_logo/steam.png", color: "bg-gray-700" },
      action: { name: "Twitch", icon: "/app_logo/twitch.png", color: "bg-purple-600" }
    },
    popularity: 73,
    category: "Gaming",
    tags: ["achievements", "streaming", "chat"]
  },
  {
    id: 8,
    title: "Twitch Follower to Telegram Group",
    description: "Get Telegram notifications when you gain new Twitch followers",
    services: {
      trigger: { name: "Twitch", icon: "/app_logo/twitch.png", color: "bg-purple-600" },
      action: { name: "Telegram", icon: "/app_logo/telegram.png", color: "bg-blue-500" }
    },
    popularity: 78,
    category: "Social",
    tags: ["followers", "growth", "notifications"]
  },
  {
    id: 9,
    title: "YouTube Subscriber Milestone Email",
    description: "Send celebration emails when you reach YouTube subscriber milestones",
    services: {
      trigger: { name: "YouTube", icon: "/app_logo/youtube.png", color: "bg-red-500" },
      action: { name: "Mail", icon: "/app_logo/mail.png", color: "bg-blue-600" }
    },
    popularity: 69,
    category: "Social",
    tags: ["milestones", "celebration", "growth"]
  },
  {
    id: 10,
    title: "Spotify New Release to YouTube Playlist",
    description: "Add new releases from followed artists to a YouTube Music playlist",
    services: {
      trigger: { name: "Spotify", icon: "/app_logo/spotify.png", color: "bg-green-500" },
      action: { name: "YouTube", icon: "/app_logo/youtube.png", color: "bg-red-500" }
    },
    popularity: 85,
    category: "Music",
    tags: ["new releases", "artists", "discovery"]
  },
  {
    id: 11,
    title: "Mail Important Messages to Telegram",
    description: "Forward emails marked as important to your personal Telegram chat",
    services: {
      trigger: { name: "Mail", icon: "/app_logo/mail.png", color: "bg-blue-600" },
      action: { name: "Telegram", icon: "/app_logo/telegram.png", color: "bg-blue-500" }
    },
    popularity: 91,
    category: "Productivity",
    tags: ["important", "filtering", "instant"]
  },
  {
    id: 12,
    title: "Steam Friend Online to Telegram",
    description: "Get notified on Telegram when specific Steam friends come online",
    services: {
      trigger: { name: "Steam", icon: "/app_logo/steam.png", color: "bg-gray-700" },
      action: { name: "Telegram", icon: "/app_logo/telegram.png", color: "bg-blue-500" }
    },
    popularity: 72,
    category: "Social",
    tags: ["friends", "online status", "gaming"]
  },
  {
    id: 13,
    title: "Twitch Stream Schedule to Mail",
    description: "Send email reminders about your upcoming Twitch stream schedule",
    services: {
      trigger: { name: "Twitch", icon: "/app_logo/twitch.png", color: "bg-purple-600" },
      action: { name: "Mail", icon: "/app_logo/mail.png", color: "bg-blue-600" }
    },
    popularity: 64,
    category: "Content Creation",
    tags: ["schedule", "reminders", "planning"]
  },
  {
    id: 14,
    title: "YouTube Comment to Telegram Moderation",
    description: "Send flagged YouTube comments to Telegram for quick moderation",
    services: {
      trigger: { name: "YouTube", icon: "/app_logo/youtube.png", color: "bg-red-500" },
      action: { name: "Telegram", icon: "/app_logo/telegram.png", color: "bg-blue-500" }
    },
    popularity: 58,
    category: "Moderation",
    tags: ["comments", "moderation", "flagged"]
  },
  {
    id: 15,
    title: "Spotify Daily Mix to Mail Summary",
    description: "Receive email summaries of your Spotify Daily Mix recommendations",
    services: {
      trigger: { name: "Spotify", icon: "/app_logo/spotify.png", color: "bg-green-500" },
      action: { name: "Mail", icon: "/app_logo/mail.png", color: "bg-blue-600" }
    },
    popularity: 61,
    category: "Music",
    tags: ["daily mix", "recommendations", "discovery"]
  }
];

interface AutomationExamplesProps {
  showAll?: boolean;
  selectedCategory?: string;
  searchQuery?: string;
}

export default function AutomationExamples({ 
  showAll = false, 
  selectedCategory = 'All',
  searchQuery = '' 
}: AutomationExamplesProps) {
  // Filter automations based on props
  let filteredExamples = automationExamples;
  
  if (selectedCategory !== 'All') {
    filteredExamples = filteredExamples.filter(example => 
      example.category === selectedCategory
    );
  }
  
  if (searchQuery) {
    filteredExamples = filteredExamples.filter(example =>
      example.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      example.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      example.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }
  
  // Show only top 3 on homepage, all on explore page
  const displayedExamples = showAll ? filteredExamples : filteredExamples.slice(0, 3);

  return (
    <div className="mt-20 max-w-6xl mx-auto px-4 py-16 bg-white">
      <div className="text-center mb-12">
        <h2 
          className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4"
          style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.2' }}
        >
          {showAll ? 'All Automations' : 'Popular Automations'}
        </h2>
        <p 
          className="text-xl text-gray-600 max-w-2xl mx-auto"
          style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
        >
          {showAll 
            ? 'Discover and create powerful automations for your workflow'
            : 'Discover what others are building with AREA'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayedExamples.map((example) => (
          <div
            key={example.id}
            className="group bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:transform hover:scale-105 cursor-pointer"
          >
            {/* Category and popularity badge */}
            <div className="flex justify-between items-start mb-4">
              <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                {example.category}
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span 
                  className="text-sm text-gray-600 font-medium"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {example.popularity}% use this
                </span>
              </div>
            </div>

            {/* Services flow */}
            <div className="flex items-center justify-between mb-6">
              {/* Trigger service */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center mb-2 shadow-sm">
                  <img 
                    src={example.services.trigger.icon} 
                    alt={example.services.trigger.name}
                    className="w-8 h-8 object-contain"
                  />
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
                <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center mb-2 shadow-sm">
                  <img 
                    src={example.services.action.icon} 
                    alt={example.services.action.name}
                    className="w-8 h-8 object-contain"
                  />
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
                className="text-gray-600 text-sm leading-relaxed mb-4"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.4' }}
              >
                {example.description}
              </p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {example.tags.slice(0, 3).map((tag) => (
                  <span 
                    key={tag}
                    className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
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

      {/* Call to action - only on homepage */}
      {!showAll && (
        <div className="text-center mt-12">
          <Link 
            to="/explore"
            className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-sm inline-block"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Explore All
          </Link>
        </div>
      )}
      
      {/* No results message */}
      {showAll && displayedExamples.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 
            className="text-lg font-medium text-gray-900 mb-2"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            No automations found
          </h3>
          <p 
            className="text-gray-600"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}

export { automationExamples };
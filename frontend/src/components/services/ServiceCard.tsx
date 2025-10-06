import { Link } from 'react-router-dom'

interface ServiceCardProps {
  type: 'service' | 'area'
  id: string
  name: string
  description: string
  icon?: string
  icons?: string[]
  color?: string
  category?: string
  automationCount?: number
  isPopular?: boolean
  connectionStatus?: {
    [key: string]: boolean
  }
  isActive?: boolean
  href: string
}

export default function ServiceCard({
  type,
  name,
  description,
  icon,
  icons,
  category,
  automationCount,
  isPopular,
  connectionStatus,
  href
}: ServiceCardProps) {
  return (
    <Link
      to={href}
      className="group bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:transform hover:scale-105 relative"
    >
      {/* AREA Badge */}
      {type === 'area' && (
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            AUTOMATION
          </span>
        </div>
      )}

      {/* Header with logo(s) */}
      <div className="flex items-start justify-between mb-3 md:mb-4">
        {type === 'area' && icons && icons.length > 0 ? (
          // Multiple icons for AREA with arrow
          <div className="flex items-center space-x-2">
            <img
              src={`/app_logo/${icons[0]}.png`}
              alt={icons[0]}
              className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=' + icons[0]
              }}
            />
            <span className="text-gray-400 text-xl">→</span>
            <img
              src={`/app_logo/${icons[1]}.png`}
              alt={icons[1]}
              className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=' + icons[1]
              }}
            />
          </div>
        ) : (
          // Single icon for regular service
          <div className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0">
            <img
              src={icon || `/app_logo/${name.toLowerCase().replace(/\s+/g, '')}.png`}
              alt={`${name} logo`}
              className="w-full h-full object-contain rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=' + name
              }}
            />
          </div>
        )}
        {isPopular && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Popular
          </span>
        )}
      </div>

      {/* Content */}
      <div className="mb-3 md:mb-4">
        <h3
          className="text-lg md:text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors duration-300"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {name}
        </h3>
        <p
          className="text-gray-600 text-sm md:text-base leading-relaxed mb-3"
          style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.4' }}
        >
          {description}
        </p>

        {/* Connection Status for AREA */}
        {type === 'area' && connectionStatus && (
          <div className="flex items-center gap-3 mb-3">
            {Object.entries(connectionStatus).map(([service, connected]) => (
              <div key={service} className="flex items-center gap-1">
                <span className={connected ? '✅' : '❌'}></span>
                <span className="text-xs text-gray-600">{service}</span>
              </div>
            ))}
          </div>
        )}

        {/* Category and automation count for regular services */}
        {type === 'service' && (
          <div className="flex items-center justify-between text-xs md:text-sm">
            <span className="text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
              {category}
            </span>
            <span className="text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
              {automationCount} automations
            </span>
          </div>
        )}
      </div>

      {/* Action button */}
      <div className="pt-3 md:pt-4 border-t border-gray-200">
        <div className="flex items-center text-gray-600 group-hover:text-gray-800 transition-colors duration-200">
          <span
            className="text-sm font-medium"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {type === 'area' ? 'Configure automation' : 'View automations'}
          </span>
          <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}

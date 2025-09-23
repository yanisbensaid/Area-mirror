export default function ExplorePage() {
  return (
    <main className="pt-20 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto py-12">
        <div className="text-center mb-12">
          <h1 
            className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-4"
            style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.2' }}
          >
            Explore Automations
          </h1>
          <p 
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
          >
            Discover, create, and manage your workflow automations
          </p>
        </div>

        {/* Content placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 
              className="text-lg font-medium text-gray-900 mb-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Browse Templates
            </h3>
            <p 
              className="text-gray-600"
              style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
            >
              Start with pre-built automation templates
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 
              className="text-lg font-medium text-gray-900 mb-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Create New
            </h3>
            <p 
              className="text-gray-600"
              style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
            >
              Build custom automations from scratch
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 
              className="text-lg font-medium text-gray-900 mb-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              My Automations
            </h3>
            <p 
              className="text-gray-600"
              style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
            >
              View and manage your existing automations
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
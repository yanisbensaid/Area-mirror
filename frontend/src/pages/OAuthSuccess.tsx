import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

export default function OAuthSuccess() {
  const [searchParams] = useSearchParams()
  const service = searchParams.get('service')

  useEffect(() => {
    // Notify parent window that OAuth succeeded
    if (window.opener) {
      window.opener.postMessage({
        type: 'OAUTH_SUCCESS',
        service: service
      }, window.location.origin)
    }

    // Close the popup after a short delay
    setTimeout(() => {
      window.close()
    }, 500)
  }, [service])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-8 max-w-md w-full text-center">
        <div className="mb-4">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Success!</h1>
          <p className="text-slate-300">
            {service ? `Successfully connected to ${service}!` : 'Connection successful!'}
          </p>
          <p className="text-slate-400 text-sm mt-4">This window will close automatically...</p>
        </div>
      </div>
    </div>
  )
}

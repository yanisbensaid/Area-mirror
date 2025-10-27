import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function OAuthCallbackPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the token from the response (backend returns it as a query parameter)
        const token = searchParams.get('token')
        const errorMsg = searchParams.get('error')

        if (errorMsg) {
          setError(errorMsg)
          setLoading(false)
          setTimeout(() => navigate('/login'), 3000)
          return
        }

        if (!token) {
          setError('No authentication token received. Please try again.')
          setLoading(false)
          setTimeout(() => navigate('/login'), 3000)
          return
        }

        // Use the auth context's login function to store the token
        await login(token)

        // Redirect to home page
        navigate('/')
      } catch (err) {
        console.error('OAuth callback error:', err)
        setError('Failed to complete authentication. Please try again.')
        setLoading(false)
        setTimeout(() => navigate('/login'), 3000)
      }
    }

    handleCallback()
  }, [searchParams, login, navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {loading ? (
          <>
            <div className="flex justify-center mb-4">
              <svg
                className="animate-spin h-12 w-12 text-gray-900"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Completing authentication...
            </h2>
            <p className="text-gray-600">
              Please wait while we complete your login.
            </p>
          </>
        ) : (
          <>
            <div className="mb-4">
              <svg
                className="h-12 w-12 text-red-600 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Authentication Error
            </h2>
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-gray-600 text-sm">
              Redirecting to login page in a few seconds...
            </p>
          </>
        )}
      </div>
    </div>
  )
}

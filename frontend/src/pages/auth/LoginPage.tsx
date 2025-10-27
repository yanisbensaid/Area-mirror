import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)

  // Load saved credentials on component mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem('rememberedCredentials')
    if (savedCredentials) {
      const { email, rememberMe: savedRememberMe } = JSON.parse(savedCredentials)
      setFormData(prev => ({ ...prev, email }))
      setRememberMe(savedRememberMe)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const toggleSignUpMode = () => {
    setIsSignUp(!isSignUp)
    // Reset email field when switching modes
    if (!isSignUp) {
      setFormData(prev => ({ ...prev, email: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate form data
    if (!formData.email || !formData.password) {
      setError('Email and password are required')
      setLoading(false)
      return
    }

    // Additional validation for sign-up
    if (isSignUp && !formData.username) {
      setError('Username is required for registration')
      setLoading(false)
      return
    }

    try {
      const endpoint = isSignUp ? 'register' : 'login'
      const requestBody = isSignUp
        ? {
            name: formData.username,
            email: formData.email,
            password: formData.password
          }
        : {
            email: formData.email,
            password: formData.password
          }

      const response = await fetch(`http://localhost:8000/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (response.ok && data.token) {
        // Use the auth context's login function
        await login(data.token)
        
        // Handle "Remember me" functionality (only for login)
        if (!isSignUp && rememberMe) {
          // Save credentials for future logins
          localStorage.setItem('rememberedCredentials', JSON.stringify({
            email: formData.email,
            rememberMe: true
          }))
        } else if (!isSignUp) {
          // Remove saved credentials if not remembering
          localStorage.removeItem('rememberedCredentials')
        }

        // Redirect to home page
        console.log(`${isSignUp ? 'Registration' : 'Login'} successful:`, data)
        navigate('/')

      } else {
        const errorMsg = data.message || data.errors
          ? Object.values(data.errors).flat().join(', ')
          : `${isSignUp ? 'Registration' : 'Login'} failed. Please check your information.`
        setError(errorMsg)
      }
    } catch (err) {
      console.error(`${isSignUp ? 'Registration' : 'Login'} error:`, err)
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setOauthLoading(provider)
    setError('')

    try {
      const response = await fetch(`http://localhost:8000/api/oauth/${provider}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok && data.url) {
        // Redirect to OAuth provider
        window.location.href = data.url
      } else {
        const errorMessage = data.message || `Failed to initiate ${provider} login. Please try again.`
        setError(errorMessage)
        setOauthLoading(null)
        console.error(`${provider} OAuth error:`, data)
      }
    } catch (err) {
      console.error(`${provider} OAuth error:`, err)
      setError('Network error. Please check your connection.')
      setOauthLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Back button */}
        <Link
          to="/"
          className="mb-8 flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>

        {/* Connection form */}
        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-lg">
          <div className="text-center mb-8">
            <h2
              className="text-3xl font-semibold text-gray-900 mb-2"
              style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.3' }}
            >
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p
              className="text-gray-600"
              style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
            >
              {isSignUp
                ? 'Join AREA and start automating your workflows'
                : 'Sign in to your AREA account'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username - Only for Sign Up */}
            {isSignUp && (
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required={isSignUp}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your username"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your email address"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your password"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>

            {/* Remember me / Forgot password */}
            {!isSignUp && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-gray-600 bg-white border-gray-300 rounded focus:ring-gray-500 focus:ring-2"
                  />
                  <span
                    className="ml-2 text-sm text-gray-600"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-white transition-all duration-200 shadow-sm ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gray-900 text-white hover:bg-gray-800 transform hover:scale-[1.02]'
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isSignUp ? 'Creating account...' : 'Signing in...'}
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>

            {/* OAuth buttons */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span
                  className="px-2 bg-white text-gray-500"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {/* Google */}
              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                disabled={oauthLoading !== null}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {oauthLoading === 'google' ? (
                  <svg className="animate-spin h-5 w-5 mr-3 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png"
                    alt="Google"
                    className="w-5 h-5 mr-3"
                  />
                )}
                <span className="font-medium">{oauthLoading === 'google' ? 'Connecting...' : 'Continue with Google'}</span>
              </button>

              {/* GitHub */}
              <button
                type="button"
                onClick={() => handleOAuthLogin('github')}
                disabled={oauthLoading !== null}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {oauthLoading === 'github' ? (
                  <svg className="animate-spin h-5 w-5 mr-3 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <img
                    src="https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png"
                    alt="GitHub"
                    className="w-5 h-5 mr-3"
                  />
                )}
                <span className="font-medium">{oauthLoading === 'github' ? 'Connecting...' : 'Continue with GitHub'}</span>
              </button>
            </div>

            {/* Toggle between sign in and sign up */}
            <div className="text-center">
              <span
                className="text-gray-600"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </span>
              <button
                type="button"
                onClick={toggleSignUpMode}
                className="ml-2 text-gray-900 hover:text-gray-700 font-medium transition-colors duration-200"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
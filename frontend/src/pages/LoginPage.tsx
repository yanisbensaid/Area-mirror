import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })
  const [isSignUp, setIsSignUp] = useState(false)

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Ici on ajouterait la logique d'authentification
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Bouton retour */}
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

        {/* Formulaire de connexion */}
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
            {/* Username */}
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
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your username"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>

            {/* Email - Only for Sign Up */}
            {isSignUp && (
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
            )}

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

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-white transform hover:scale-[1.02] transition-all duration-200 shadow-sm"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
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
                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <img 
                  src="/app_logo/google.png" 
                  alt="Google" 
                  className="w-5 h-5 mr-3"
                />
                <span className="font-medium">Continue with Google</span>
              </button>

              {/* Outlook */}
              <button
                type="button"
                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <img 
                  src="/app_logo/outlook.png" 
                  alt="Outlook" 
                  className="w-5 h-5 mr-3"
                />
                <span className="font-medium">Continue with Outlook</span>
              </button>

              {/* GitHub */}
              <button
                type="button"
                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <img 
                  src="/app_logo/github.png" 
                  alt="GitHub" 
                  className="w-5 h-5 mr-3"
                />
                <span className="font-medium">Continue with GitHub</span>
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
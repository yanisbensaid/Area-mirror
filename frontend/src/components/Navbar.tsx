import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

export default function Navbar() {
  const location = useLocation()
  const isExplorePage = location.pathname === '/explore'
  const isServicesPage = location.pathname === '/services'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800 shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo AREA */}
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="text-xl md:text-2xl font-semibold text-white hover:text-gray-300 transition-colors duration-200"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            AREA
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 lg:space-x-12">
            {/* Bouton Explore */}
            <Link
              to="/explore"
              className="group relative text-gray-300 font-medium transition-colors duration-200 hover:text-white py-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Explore
              {/* Barre active (quand on est sur la page) */}
              {isExplorePage && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white"></span>
              )}
              {/* Barre hover (seulement si pas sur la page active) */}
              {!isExplorePage && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center"></span>
              )}
            </Link>

            {/* Bouton Services */}
            <Link
              to="/services"
              className="group relative text-gray-300 font-medium transition-colors duration-200 hover:text-white py-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Services
              {/* Barre active (quand on est sur la page) */}
              {isServicesPage && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white"></span>
              )}
              {/* Barre hover (seulement si pas sur la page active) */}
              {!isServicesPage && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center"></span>
              )}
            </Link>

            {/* Bouton Login */}
            <Link
              to="/login"
              className="bg-white hover:bg-gray-100 text-gray-900 px-4 lg:px-6 py-2 rounded-lg font-medium transition-all duration-200 border border-white hover:border-gray-100"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Login
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-300 hover:text-white focus:outline-none focus:text-white transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/explore"
                onClick={closeMobileMenu}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isExplorePage 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Explore
              </Link>
              <Link
                to="/services"
                onClick={closeMobileMenu}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isServicesPage 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Services
              </Link>
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="block px-3 py-2 mt-3 bg-white hover:bg-gray-100 text-gray-900 rounded-md text-base font-medium transition-colors duration-200 text-center"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
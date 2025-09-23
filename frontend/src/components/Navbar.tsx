import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()
  const isExplorePage = location.pathname === '/explore'

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo AREA */}
          <Link
            to="/"
            className="text-2xl font-semibold text-gray-900 hover:text-gray-700 transition-colors duration-200"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            AREA
          </Link>

          {/* Navigation buttons */}
          <div className="flex items-center space-x-12">
            {/* Bouton Explore */}
            <Link
              to="/explore"
              className="group relative text-gray-800 font-medium transition-colors duration-200 hover:text-gray-600 py-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Explore
              {/* Barre active (quand on est sur la page) */}
              {isExplorePage && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-800"></span>
              )}
              {/* Barre hover (seulement si pas sur la page active) */}
              {!isExplorePage && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center"></span>
              )}
            </Link>

            {/* Bouton Login */}
            <Link
              to="/login"
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 border border-gray-900 hover:border-gray-800"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
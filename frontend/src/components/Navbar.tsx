import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-black text-white shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo AREA */}
          <Link
            to="/"
            className="text-2xl font-bold text-white hover:text-blue-400 transition-colors duration-200"
          >
            AREA
          </Link>

          {/* Bouton Login */}
          <Link
            to="/login"
            className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 border border-slate-600 hover:border-slate-500"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
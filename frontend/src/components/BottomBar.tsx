import { Link } from 'react-router-dom'

export default function BottomBar() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { name: 'Features', href: '/explore' },
      { name: 'Services', href: '/' },
      { name: 'API Documentation', href: '#' },
      { name: 'Pricing', href: '#' }
    ],
    company: [
      { name: 'About Us', href: '/about-us' },
      { name: 'Blog', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Contact', href: '#' }
    ],
    support: [
      { name: 'Help Center', href: '#' },
      { name: 'Community', href: '#' },
      { name: 'Status', href: '#' },
      { name: 'Security', href: '#' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy-policy' },
      { name: 'Terms of Service', href: '/terms-of-service' },
      { name: 'Cookie Policy', href: '/cookie-policy' },
      { name: 'GDPR', href: '#' }
    ]
  }

  const socialLinks = [
    {
      name: 'GitHub',
      href: 'https://github.com',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
        </svg>
      )
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      )
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    },
    {
      name: 'Discord',
      href: 'https://discord.com',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.445.865-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.249.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.010c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.197.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
      )
    }
  ]

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 md:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span 
                  className="text-gray-900 font-semibold text-lg"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  A
                </span>
              </div>
              <span 
                className="text-xl font-semibold text-white"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                AREA
              </span>
            </div>
            <p 
              className="text-gray-300 mb-6 max-w-md"
              style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
            >
              Connect your apps and automate your workflows with powerful automation tools. 
              Streamline your digital life with AREA.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 
              className="text-sm font-semibold text-white uppercase tracking-wider mb-4"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Product
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 
              className="text-sm font-semibold text-white uppercase tracking-wider mb-4"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  {link.href.startsWith('/') ? (
                    <Link
                      to={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 
              className="text-sm font-semibold text-white uppercase tracking-wider mb-4"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Support
            </h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 
              className="text-sm font-semibold text-white uppercase tracking-wider mb-4"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Legal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  {link.href.startsWith('/') ? (
                    <Link
                      to={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-md">
            <h3 
              className="text-sm font-semibold text-white uppercase tracking-wider mb-4"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Stay Updated
            </h3>
            <p 
              className="text-gray-300 mb-4"
              style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
            >
              Get the latest updates on new integrations and features.
            </p>
            <div className="flex space-x-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all duration-200 text-white placeholder-gray-400"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
              <button
                className="bg-white hover:bg-gray-100 text-gray-900 px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <p 
                className="text-gray-300"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                © {currentYear} AREA. All rights reserved.
              </p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span 
                  className="text-sm text-gray-300"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  All systems operational
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <label htmlFor="language-select" className="sr-only">Select language</label>
              <select 
                id="language-select"
                aria-label="Select language"
                className="text-sm text-gray-300 bg-transparent border-none focus:outline-none cursor-pointer"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <option value="en" className="bg-gray-900">🇺🇸 English</option>
                <option value="fr" className="bg-gray-900">🇫🇷 Français</option>
                <option value="es" className="bg-gray-900">🇪🇸 Español</option>
                <option value="de" className="bg-gray-900">🇩🇪 Deutsch</option>
              </select>
              
              <div className="flex items-center space-x-2">
                <span 
                  className="text-sm text-gray-300"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Made with ❤️ by AREA Team
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
import { Link } from 'react-router-dom'

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 
              className="text-4xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Cookie Policy
            </h1>
            <p 
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
            >
              This Cookie Policy explains how AREA uses cookies and similar technologies 
              to recognize you when you visit our website.
            </p>
            <p 
              className="text-sm text-gray-500 mt-4"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Last updated: September 24, 2025
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="prose prose-lg max-w-none">
          
          {/* What are cookies */}
          <section className="mb-12">
            <h2 
              className="text-2xl font-semibold text-gray-900 mb-6"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              What are cookies?
            </h2>
            <p 
              className="text-gray-700 mb-4"
              style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
            >
              Cookies are small data files that are placed on your computer or mobile device when you visit a website. 
              Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, 
              as well as to provide reporting information.
            </p>
            <p 
              className="text-gray-700"
              style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
            >
              Cookies set by the website owner (in this case, AREA) are called "first party cookies". 
              Cookies set by parties other than the website owner are called "third party cookies". 
              Third party cookies enable third party features or functionality to be provided on or through the website.
            </p>
          </section>

          {/* Why do we use cookies */}
          <section className="mb-12">
            <h2 
              className="text-2xl font-semibold text-gray-900 mb-6"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Why do we use cookies?
            </h2>
            <p 
              className="text-gray-700 mb-4"
              style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
            >
              We use first and third party cookies for several reasons. Some cookies are required for technical reasons 
              in order for our website to operate, and we refer to these as "essential" or "strictly necessary" cookies. 
              Other cookies also enable us to track and target the interests of our users to enhance the experience on our website.
            </p>
          </section>

          {/* Types of cookies we use */}
          <section className="mb-12">
            <h2 
              className="text-2xl font-semibold text-gray-900 mb-6"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Types of cookies we use
            </h2>
            
            <div className="space-y-8">
              {/* Essential cookies */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 
                  className="text-xl font-semibold text-gray-900 mb-3"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Essential cookies
                </h3>
                <p 
                  className="text-gray-700 mb-3"
                  style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
                >
                  These cookies are strictly necessary to provide you with services available through our website 
                  and to use some of its features, such as access to secure areas.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li style={{ fontFamily: 'Inter, sans-serif' }}>Authentication cookies to remember your login status</li>
                  <li style={{ fontFamily: 'Inter, sans-serif' }}>Security cookies to protect against malicious attacks</li>
                  <li style={{ fontFamily: 'Inter, sans-serif' }}>Session cookies to maintain your browsing session</li>
                </ul>
              </div>

              {/* Performance cookies */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 
                  className="text-xl font-semibold text-gray-900 mb-3"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Performance and Analytics cookies
                </h3>
                <p 
                  className="text-gray-700 mb-3"
                  style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
                >
                  These cookies allow us to count visits and traffic sources so we can measure and improve 
                  the performance of our site. They help us to know which pages are the most and least popular.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li style={{ fontFamily: 'Inter, sans-serif' }}>Google Analytics cookies to understand user behavior</li>
                  <li style={{ fontFamily: 'Inter, sans-serif' }}>Performance monitoring cookies to track site speed</li>
                  <li style={{ fontFamily: 'Inter, sans-serif' }}>Error tracking cookies to identify and fix issues</li>
                </ul>
              </div>

              {/* Functionality cookies */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 
                  className="text-xl font-semibold text-gray-900 mb-3"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Functionality cookies
                </h3>
                <p 
                  className="text-gray-700 mb-3"
                  style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
                >
                  These cookies enable the website to provide enhanced functionality and personalization. 
                  They may be set by us or by third party providers whose services we have added to our pages.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li style={{ fontFamily: 'Inter, sans-serif' }}>Language preference cookies</li>
                  <li style={{ fontFamily: 'Inter, sans-serif' }}>Theme and display preference cookies</li>
                  <li style={{ fontFamily: 'Inter, sans-serif' }}>User interface customization cookies</li>
                </ul>
              </div>

              {/* Targeting cookies */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 
                  className="text-xl font-semibold text-gray-900 mb-3"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Targeting and Advertising cookies
                </h3>
                <p 
                  className="text-gray-700 mb-3"
                  style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
                >
                  These cookies may be set through our site by our advertising partners. 
                  They may be used by those companies to build a profile of your interests.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li style={{ fontFamily: 'Inter, sans-serif' }}>Social media advertising cookies</li>
                  <li style={{ fontFamily: 'Inter, sans-serif' }}>Retargeting cookies for relevant ads</li>
                  <li style={{ fontFamily: 'Inter, sans-serif' }}>Cross-site tracking prevention cookies</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How to control cookies */}
          <section className="mb-12">
            <h2 
              className="text-2xl font-semibold text-gray-900 mb-6"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              How can you control cookies?
            </h2>
            <p 
              className="text-gray-700 mb-4"
              style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
            >
              You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights 
              by setting your preferences in the Cookie Consent Manager. The Cookie Consent Manager allows you to 
              select which categories of cookies you accept or reject.
            </p>
            <p 
              className="text-gray-700 mb-6"
              style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
            >
              You can also set or amend your web browser controls to accept or refuse cookies. 
              If you choose to reject cookies, you may still use our website though your access to some 
              functionality and areas of our website may be restricted.
            </p>

            {/* Browser settings */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 
                className="text-lg font-semibold text-blue-900 mb-4"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Browser Cookie Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-blue-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Google Chrome</h4>
                  <p className="text-blue-800 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Settings → Privacy and security → Cookies and other site data
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Mozilla Firefox</h4>
                  <p className="text-blue-800 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Options → Privacy & Security → Cookies and Site Data
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Safari</h4>
                  <p className="text-blue-800 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Preferences → Privacy → Manage Website Data
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Microsoft Edge</h4>
                  <p className="text-blue-800 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Settings → Cookies and site permissions → Cookies and site data
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Updates */}
          <section className="mb-12">
            <h2 
              className="text-2xl font-semibold text-gray-900 mb-6"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Updates to this Cookie Policy
            </h2>
            <p 
              className="text-gray-700"
              style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
            >
              We may update this Cookie Policy from time to time in order to reflect changes to the cookies we use 
              or for other operational, legal or regulatory reasons. Please therefore re-visit this Cookie Policy 
              regularly to stay informed about our use of cookies and related technologies.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <h2 
              className="text-2xl font-semibold text-gray-900 mb-6"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Contact us
            </h2>
            <p 
              className="text-gray-700 mb-4"
              style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
            >
              If you have any questions about our use of cookies or other technologies, please contact us at:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                <strong>Email:</strong> privacy@area-app.com<br />
                <strong>Address:</strong> AREA Team, Epitech Lyon, France
              </p>
            </div>
          </section>

        </div>

        {/* Back to home */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
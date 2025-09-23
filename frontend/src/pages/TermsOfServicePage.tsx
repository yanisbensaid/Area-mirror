import { Link } from 'react-router-dom'

export default function TermsOfServicePage() {
  const lastUpdated = "September 23, 2025"

  return (
    <main className="pt-20 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto py-12">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200 mb-6"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          
          <h1 
            className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-4"
            style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.2' }}
          >
            Terms of Service
          </h1>
          <p 
            className="text-lg text-gray-600"
            style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
          >
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
          <div className="prose prose-gray max-w-none">
            
            {/* Introduction */}
            <section className="mb-8">
              <h2 
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Agreement to Terms
              </h2>
              <p 
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
              >
                Welcome to AREA! These Terms of Service ("Terms") govern your use of our automation platform and services operated by AREA Team ("we," "our," or "us"). By accessing or using our service, you agree to be bound by these Terms.
              </p>
              <p 
                className="text-gray-700 leading-relaxed"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
              >
                If you disagree with any part of these terms, then you may not access the service.
              </p>
            </section>

            {/* Description of Service */}
            <section className="mb-8">
              <h2 
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Description of Service
              </h2>
              <p 
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
              >
                AREA is an automation platform that allows users to create workflows by connecting different applications and services. Our service enables you to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Connect and integrate various third-party applications and services
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Create automated workflows and triggers between connected services
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Monitor and manage your automation workflows
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Access analytics and performance metrics for your automations
                </li>
              </ul>
            </section>

            {/* User Accounts */}
            <section className="mb-8">
              <h2 
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                User Accounts
              </h2>
              <p 
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
              >
                To use certain features of our service, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Provide accurate, current, and complete information during registration
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Maintain and promptly update your account information
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Maintain the security of your password and account credentials
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Accept responsibility for all activities under your account
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Notify us immediately of any unauthorized access or security breach
                </li>
              </ul>
            </section>

            {/* Acceptable Use */}
            <section className="mb-8">
              <h2 
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Acceptable Use Policy
              </h2>
              <p 
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
              >
                You agree not to use our service to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Violate any applicable laws, regulations, or third-party rights
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Create automations that spam, harass, or harm other users
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Attempt to gain unauthorized access to our systems or other users' accounts
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Interfere with or disrupt the integrity or performance of our service
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Use our service for any illegal, fraudulent, or malicious activities
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Reverse engineer, decompile, or attempt to extract source code
                </li>
              </ul>
            </section>

            {/* Third-Party Services */}
            <section className="mb-8">
              <h2 
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Third-Party Services
              </h2>
              <p 
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
              >
                Our service integrates with various third-party applications and services. You acknowledge that:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  You must comply with the terms of service of each connected third-party service
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  We are not responsible for the availability, functionality, or policies of third-party services
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Changes to third-party services may affect your automations
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  You grant us necessary permissions to access your connected accounts for automation purposes
                </li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section className="mb-8">
              <h2 
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Intellectual Property Rights
              </h2>
              <p 
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
              >
                The AREA service and its original content, features, and functionality are and will remain the exclusive property of AREA Team and its licensors. The service is protected by copyright, trademark, and other laws.
              </p>
              <p 
                className="text-gray-700 leading-relaxed"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
              >
                You retain ownership of any content you create through our service, but grant us a license to use, store, and process this content to provide our services.
              </p>
            </section>

            {/* Service Availability */}
            <section className="mb-8">
              <h2 
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Service Availability and Modifications
              </h2>
              <p 
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
              >
                We strive to provide reliable service, but we cannot guarantee uninterrupted availability. We reserve the right to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Modify, suspend, or discontinue any part of our service at any time
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Perform maintenance that may temporarily affect service availability
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Update our terms of service with reasonable notice
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Implement usage limits or restrictions as necessary
                </li>
              </ul>
            </section>

            {/* Disclaimers */}
            <section className="mb-8">
              <h2 
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Disclaimers and Limitation of Liability
              </h2>
              <p 
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
              >
                Our service is provided "as is" without warranties of any kind. We disclaim all warranties, express or implied, including but not limited to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Warranties of merchantability and fitness for a particular purpose
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Warranties of uninterrupted or error-free service
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Warranties regarding the accuracy or reliability of content
                </li>
              </ul>
              <p 
                className="text-gray-700 leading-relaxed"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
              >
                In no event shall AREA Team be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our service.
              </p>
            </section>

            {/* Account Termination */}
            <section className="mb-8">
              <h2 
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Account Termination
              </h2>
              <p 
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
              >
                You may terminate your account at any time by contacting us or using the account deletion feature. We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users or our service.
              </p>
              <p 
                className="text-gray-700 leading-relaxed"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
              >
                Upon termination, your right to use the service will cease immediately, and we may delete your account data in accordance with our Privacy Policy.
              </p>
            </section>

            {/* Governing Law */}
            <section className="mb-8">
              <h2 
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Governing Law and Dispute Resolution
              </h2>
              <p 
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
              >
                These Terms shall be interpreted and governed by the laws of France, without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of our service will be resolved through good faith negotiations.
              </p>
              <p 
                className="text-gray-700 leading-relaxed"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
              >
                If a dispute cannot be resolved through negotiation, it will be subject to the exclusive jurisdiction of the courts in France.
              </p>
            </section>

            {/* Changes to Terms */}
            <section className="mb-8">
              <h2 
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Changes to These Terms
              </h2>
              <p 
                className="text-gray-700 leading-relaxed"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
              >
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. By continuing to access or use our service after those revisions become effective, you agree to be bound by the revised terms.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Contact Information
              </h2>
              <p 
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
              >
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <strong>Email:</strong> legal@area.com
                </p>
                <p className="text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <strong>Address:</strong> AREA Team, Epitech Technology, France
                </p>
                <p className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <strong>Response Time:</strong> We aim to respond to all legal inquiries within 5 business days
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </main>
  )
}
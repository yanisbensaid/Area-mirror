import { Link } from 'react-router-dom'

export default function PrivacyPolicyPage() {
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
            Privacy Policy
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
                Introduction
              </h2>
              <p 
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
              >
                Welcome to AREA ("we," "our," or "us"). We are committed to protecting your privacy and ensuring transparency about how we collect, use, and protect your personal information. This Privacy Policy explains how we handle your data when you use our automation platform and services.
              </p>
              <p 
                className="text-gray-700 leading-relaxed"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
              >
                By using AREA, you agree to the collection and use of information in accordance with this Privacy Policy.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <h2 
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Information We Collect
              </h2>
              
              <h3 
                className="text-xl font-medium text-gray-900 mb-3"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Personal Information
              </h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Account information (email address, username, password)
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Profile information you choose to provide
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Communication preferences and settings
                </li>
              </ul>

              <h3 
                className="text-xl font-medium text-gray-900 mb-3"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Service Integration Data
              </h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Authentication tokens and credentials for connected services
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Automation configurations and workflows you create
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Data exchanged between connected services as part of your automations
                </li>
              </ul>

              <h3 
                className="text-xl font-medium text-gray-900 mb-3"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Usage Information
              </h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Log data (IP address, browser type, pages visited, time stamps)
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Device information and operating system details
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Usage patterns and performance metrics
                </li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section className="mb-8">
              <h2 
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  To provide, maintain, and improve our automation services
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  To authenticate your identity and secure your account
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  To execute automations and connect your selected services
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  To send important service notifications and updates
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  To analyze usage patterns and improve user experience
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  To provide customer support and respond to inquiries
                </li>
              </ul>
            </section>

            {/* Information Sharing */}
            <section className="mb-8">
              <h2 
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Information Sharing and Disclosure
              </h2>
              <p 
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
              >
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  <strong>With Connected Services:</strong> As necessary to execute your automations and connect your selected third-party services
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  <strong>With Your Consent:</strong> When you explicitly authorize us to share specific information
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  <strong>For Legal Compliance:</strong> When required by law, court order, or governmental authority
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  <strong>Service Providers:</strong> With trusted partners who assist in providing our services (under strict confidentiality agreements)
                </li>
              </ul>
            </section>

            {/* Data Security */}
            <section className="mb-8">
              <h2 
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Data Security
              </h2>
              <p 
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
              >
                We implement industry-standard security measures to protect your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Encryption of data in transit and at rest
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Secure authentication protocols and access controls
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Regular security audits and monitoring
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  Limited access to personal data by authorized personnel only
                </li>
              </ul>
            </section>

            {/* Your Rights */}
            <section className="mb-8">
              <h2 
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Your Rights
              </h2>
              <p 
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
              >
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  <strong>Access:</strong> Request access to your personal data we hold
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  <strong>Correction:</strong> Request correction of inaccurate or incomplete data
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  <strong>Deletion:</strong> Request deletion of your personal data (subject to legal requirements)
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  <strong>Portability:</strong> Request transfer of your data to another service
                </li>
                <li className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  <strong>Withdrawal:</strong> Withdraw consent for data processing at any time
                </li>
              </ul>
            </section>

            {/* Data Retention */}
            <section className="mb-8">
              <h2 
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Data Retention
              </h2>
              <p 
                className="text-gray-700 leading-relaxed"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
              >
                We retain your personal information only as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy. When you delete your account, we will delete or anonymize your personal data within 30 days, except where we are required to retain certain information for legal compliance.
              </p>
            </section>

            {/* Changes to Privacy Policy */}
            <section className="mb-8">
              <h2 
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Changes to This Privacy Policy
              </h2>
              <p 
                className="text-gray-700 leading-relaxed"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
              >
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 
                className="text-2xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Contact Us
              </h2>
              <p 
                className="text-gray-700 leading-relaxed mb-4"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
              >
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <strong>Email:</strong> privacy@area.com
                </p>
                <p className="text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <strong>Address:</strong> AREA Team, Epitech Technology, France
                </p>
                <p className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <strong>Response Time:</strong> We aim to respond to all privacy inquiries within 72 hours
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </main>
  )
}
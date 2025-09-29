import { Link } from 'react-router-dom'

export default function AboutUsPage() {
  const teamMembers = [
    {
      name: "Marius",
      role: "Frontend Developer & UI/UX Designer",
      description: "Passionate about creating intuitive user interfaces and seamless user experiences. Specializes in React and modern web technologies.",
      image: "/group_member/Marius.jpeg",
      skills: ["React", "TypeScript", "Tailwind CSS", "UI/UX Design"]
    },
    {
      name: "Théa",
      role: "Backend Developer & Database Architect",
      description: "Expert in server-side development and database design. Focuses on building robust APIs and scalable backend systems.",
      image: "https://via.placeholder.com/300x300/ec4899/ffffff?text=T",
      skills: ["Laravel", "PHP", "PostGreSQL", "API Development"]
    }
  ]

  const features = [
    {
      icon: "🔗",
      title: "Seamless Integration",
      description: "Connect hundreds of apps and services with just a few clicks"
    },
    {
      icon: "⚡",
      title: "Lightning Fast",
      description: "Instant automation execution with real-time synchronization"
    },
    {
      icon: "🛡️",
      title: "Secure & Reliable",
      description: "Enterprise-grade security with 99.9% uptime guarantee"
    },
    {
      icon: "🎯",
      title: "User-Friendly",
      description: "Intuitive interface designed for both beginners and experts"
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 
              className="text-5xl font-bold text-white mb-6"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">AREA</span>
            </h1>
            <p 
              className="text-xl text-gray-300 max-w-3xl mx-auto mb-8"
              style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.7' }}
            >
              We're on a mission to simplify automation and help people connect their digital world. 
              AREA is the next-generation automation platform that makes it easy to connect apps, 
              devices, and services together.
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span 
                className="text-green-400 font-medium"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Currently in active development
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              className="text-3xl font-bold text-gray-900 mb-6"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Our Mission
            </h2>
            <p 
              className="text-lg text-gray-600 max-w-3xl mx-auto"
              style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.7' }}
            >
              In today's digital age, we use dozens of apps and services every day. 
              AREA bridges the gap between these disconnected tools, creating a unified ecosystem 
              where your favorite apps work together seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 
                  className="text-xl font-semibold text-gray-900 mb-3"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {feature.title}
                </h3>
                <p 
                  className="text-gray-600"
                  style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 
                className="text-3xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.7' }}>
                <p>
                  AREA was born from a simple observation: despite living in the most connected era in history, 
                  our digital tools often work in isolation. We found ourselves constantly switching between apps, 
                  manually transferring data, and repeating the same tasks over and over.
                </p>
                <p>
                  As students at Epitech, we decided to tackle this challenge head-on. We envisioned a platform 
                  that would act as the central nervous system of your digital life, intelligently connecting 
                  your apps and automating your workflows.
                </p>
                <p>
                  Today, AREA is more than just an automation tool – it's a platform that empowers users to 
                  create their own digital ecosystem, where every app, service, and device works in perfect harmony.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                <h3 
                  className="text-2xl font-bold mb-4"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Built at Epitech Montpellier
                </h3>
                <p 
                  className="text-blue-100 mb-6"
                  style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
                >
                  Developed as part of our curriculum, AREA represents the culmination of our learning 
                  in modern web development, system architecture, and user experience design.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎓</span>
                  </div>
                  <div>
                    <div className="font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>Academic Project</div>
                    <div className="text-blue-200 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>TEK3 - G-DEV-500</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              className="text-3xl font-bold text-gray-900 mb-6"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Meet Our Team
            </h2>
            <p 
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.7' }}
            >
              The passionate developers behind AREA, dedicated to creating the best automation experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center mb-6">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-20 h-20 rounded-full mr-6"
                    />
                    <div>
                      <h3 
                        className="text-2xl font-bold text-gray-900"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {member.name}
                      </h3>
                      <p 
                        className="text-blue-600 font-medium"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {member.role}
                      </p>
                    </div>
                  </div>
                  <p 
                    className="text-gray-600 mb-6"
                    style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
                  >
                    {member.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill, skillIndex) => (
                      <span 
                        key={skillIndex}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              className="text-3xl font-bold text-gray-900 mb-6"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Built with Modern Technology
            </h2>
            <p 
              className="text-lg text-gray-600 max-w-3xl mx-auto"
              style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.7' }}
            >
              We use cutting-edge technologies to ensure AREA is fast, reliable, and scalable.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[
              { name: "React", color: "text-blue-500" },
              { name: "TypeScript", color: "text-blue-600" },
              { name: "Laravel", color: "text-red-500" },
              { name: "PHP", color: "text-purple-600" },
              { name: "PostGreSQL", color: "text-blue-700" },
              { name: "Tailwind CSS", color: "text-teal-500" }
            ].map((tech, index) => (
              <div key={index} className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className={`text-2xl font-bold ${tech.color} mb-2`} style={{ fontFamily: 'Inter, sans-serif' }}>
                  {tech.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 
            className="text-3xl font-bold text-white mb-6"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Get in Touch
          </h2>
          <p 
            className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
            style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.7' }}
          >
            Have questions about AREA or want to collaborate? We'd love to hear from you!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:contact@area-app.com"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors duration-200"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              📧 Contact Us
            </a>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors duration-200"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              🚀 Try AREA
            </Link>
          </div>
        </div>
      </div>

      {/* Back to home */}
      <div className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
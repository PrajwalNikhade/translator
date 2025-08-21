'use client';

import { useState } from 'react';
import { 
  Globe, 
  Users, 
  Award, 
  Heart, 
  Target, 
  Lightbulb,
  ArrowRight,
  PlayCircle,
  MapPin,
  Calendar
} from 'lucide-react';

const About = () => {
  const [activeTab, setActiveTab] = useState('mission');

  const stats = [
    { number: '50M+', label: 'Translations Completed', icon: <Globe className="h-6 w-6" /> },
    { number: '1M+', label: 'Active Users', icon: <Users className="h-6 w-6" /> },
    { number: '100+', label: 'Languages Supported', icon: <Award className="h-6 w-6" /> },
    { number: '99.9%', label: 'Uptime Guarantee', icon: <Heart className="h-6 w-6" /> }
  ];

  const team = [
    {
      name: 'Sarah Chen',
      role: 'CEO & Co-Founder',
      bio: 'Former Google Translate lead with 15+ years in AI and linguistics',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
      location: 'San Francisco, CA'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'CTO & Co-Founder',
      bio: 'AI researcher and former OpenAI engineer specializing in NLP',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      location: 'Austin, TX'
    },
    {
      name: 'Dr. Amara Okafor',
      role: 'Head of Linguistics',
      bio: 'PhD in Computational Linguistics from Stanford University',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
      location: 'London, UK'
    },
    {
      name: 'Kenji Nakamura',
      role: 'Head of Engineering',
      bio: 'Former Apple engineer with expertise in scalable systems',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      location: 'Tokyo, Japan'
    }
  ];

  const values = [
    {
      title: 'Global Connection',
      description: 'We believe language should never be a barrier to human connection and understanding.',
      icon: <Globe className="h-8 w-8" />,
      color: 'from-blue-500 to-purple-500'
    },
    {
      title: 'Innovation First',
      description: 'We push the boundaries of what\'s possible with AI and machine learning.',
      icon: <Lightbulb className="h-8 w-8" />,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      title: 'Quality & Accuracy',
      description: 'We maintain the highest standards of translation quality and cultural sensitivity.',
      icon: <Award className="h-8 w-8" />,
      color: 'from-green-500 to-teal-500'
    },
    {
      title: 'User-Centric',
      description: 'Every feature we build is designed with our users\' needs at the center.',
      icon: <Heart className="h-8 w-8" />,
      color: 'from-pink-500 to-rose-500'
    }
  ];

  const tabs = [
    { id: 'mission', label: 'Our Mission', icon: <Target className="h-5 w-5" /> },
    { id: 'story', label: 'Our Story', icon: <PlayCircle className="h-5 w-5" /> },
    { id: 'values', label: 'Our Values', icon: <Heart className="h-5 w-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Breaking Down
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {' '}Language Barriers
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              We're on a mission to connect the world through seamless, accurate, 
              and culturally-aware translation technology.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white mx-auto mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Tabs */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Tab Navigation */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
              {activeTab === 'mission' && (
                <div className="text-center">
                  <Target className="h-16 w-16 text-blue-500 mx-auto mb-6" />
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                  <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    At TranslateHub, we believe that language should never be a barrier to human connection, 
                    understanding, or opportunity. Our mission is to create the world's most accurate, 
                    culturally-aware, and accessible translation technology that empowers individuals and 
                    organizations to communicate seamlessly across linguistic boundaries.
                  </p>
                  <div className="grid md:grid-cols-2 gap-8 mt-12">
                    <div className="p-6 bg-blue-50 rounded-2xl">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">For Individuals</h3>
                      <p className="text-gray-600">
                        Enabling personal connections, travel experiences, and learning opportunities 
                        without language constraints.
                      </p>
                    </div>
                    <div className="p-6 bg-purple-50 rounded-2xl">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">For Businesses</h3>
                      <p className="text-gray-600">
                        Facilitating global commerce, customer support, and team collaboration 
                        across diverse linguistic markets.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'story' && (
                <div>
                  <PlayCircle className="h-16 w-16 text-blue-500 mx-auto mb-6" />
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Story</h2>
                  <div className="space-y-8">
                    {timeline.map((item, index) => (
                      <div key={index} className="flex items-start gap-6">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white">
                            {item.icon}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl font-bold text-blue-500">{item.year}</span>
                            <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                          </div>
                          <p className="text-gray-600">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'values' && (
                <div>
                  <Heart className="h-16 w-16 text-blue-500 mx-auto mb-6" />
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Values</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    {values.map((value, index) => (
                      <div key={index} className="p-6 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${value.color} flex items-center justify-center text-white mb-4`}>
                          {value.icon}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                        <p className="text-gray-600">{value.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Passionate linguists, engineers, and innovators working together to connect the world
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="group text-center">
                <div className="relative mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-48 h-48 rounded-2xl mx-auto object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl group-hover:from-black/30 transition-all duration-300"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm mb-3">{member.bio}</p>
                <div className="flex items-center justify-center text-gray-500 text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  {member.location}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Join Our Mission
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Whether you're looking to connect with others or build your business globally, 
            we're here to help you break down language barriers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center">
              Start Translating
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300">
              Join Our Team
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

  const timeline = [
    {
      year: '2019',
      title: 'The Beginning',
      description: 'Founded with a vision to break down language barriers worldwide',
      icon: <Lightbulb className="h-5 w-5" />
    },
    {
      year: '2020',
      title: 'AI Revolution',
      description: 'Launched our first AI-powered translation engine',
      icon: <Target className="h-5 w-5" />
    },
    {
      year: '2021',
      title: 'Global Expansion',
      description: 'Reached 50+ languages and 100,000 users',
      icon: <Globe className="h-5 w-5" />
    },
    {
      year: '2022',
      title: 'Enterprise Launch',
      description: 'Introduced enterprise solutions for businesses',
      icon: <Users className="h-5 w-5" />
    },
    {
      year: '2023',
      title: 'Innovation Milestone',
      description: 'Achieved 99% translation accuracy with advanced neural networks',
      icon: <Award className="h-5 w-5" />
    },
    {
      year: '2024',
      title: 'Present Day',
      description: 'Serving millions of users across 195+ countries',
      icon: <Heart className="h-5 w-5" />
    }
]
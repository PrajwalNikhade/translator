'use client';

import { useState } from 'react';
import { 
  Zap, 
  Shield, 
  Users, 
  Clock, 
  FileText, 
  Mic, 
  Camera, 
  Brain,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const Features = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const mainFeatures = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Lightning Fast Translation",
      description: "Get instant translations powered by advanced AI technology. Process thousands of words in seconds.",
      highlights: ["Real-time processing", "Batch translation", "99.9% uptime"],
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Enterprise Security",
      description: "Your data is protected with end-to-end encryption and enterprise-grade security protocols.",
      highlights: ["End-to-end encryption", "GDPR compliant", "SOC 2 certified"],
      color: "from-green-400 to-blue-500"
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Accuracy",
      description: "Context-aware translations that understand nuance, idioms, and cultural references.",
      highlights: ["Context understanding", "Cultural adaptation", "Continuous learning"],
      color: "from-purple-400 to-pink-500"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Team Collaboration",
      description: "Work together seamlessly with shared projects, comments, and version control.",
      highlights: ["Real-time collaboration", "Version history", "Team workspaces"],
      color: "from-blue-400 to-indigo-500"
    }
  ];

  const additionalFeatures = [
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Document Translation",
      description: "Upload and translate entire documents while preserving formatting."
    },
    {
      icon: <Mic className="h-6 w-6" />,
      title: "Voice Translation",
      description: "Speak naturally and get instant voice translations in real-time."
    },
    {
      icon: <Camera className="h-6 w-6" />,
      title: "Image Translation",
      description: "Point your camera at text and get instant translations overlay."
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Translation Memory",
      description: "Save time with intelligent suggestions from previous translations."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Powerful Features for
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {' '}Perfect Translation
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Discover advanced translation capabilities designed to meet every need, 
              from personal communication to enterprise-level localization.
            </p>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Feature Navigation */}
            <div className="space-y-6">
              {mainFeatures.map((feature, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                    activeFeature === index
                      ? 'bg-white shadow-xl scale-105'
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {feature.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {feature.highlights.map((highlight, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature Showcase */}
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${mainFeatures[activeFeature].color} flex items-center justify-center text-white mb-6`}>
                  {mainFeatures[activeFeature].icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {mainFeatures[activeFeature].title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {mainFeatures[activeFeature].description}
                </p>
                <div className="space-y-3">
                  {mainFeatures[activeFeature].highlights.map((highlight, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools and features to handle any translation challenge
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {additionalFeatures.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Experience These Features?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start your free trial today and discover how our advanced features can transform your translation workflow.
          </p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center">
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Features;
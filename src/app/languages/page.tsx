'use client';

import { useState } from 'react';
import { Search, Globe, Users, TrendingUp, CheckCircle } from 'lucide-react';

const Languages = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const languageCategories = [
    { id: 'all', name: 'All Languages', count: 100 },
    { id: 'popular', name: 'Popular', count: 25 },
    { id: 'european', name: 'European', count: 35 },
    { id: 'asian', name: 'Asian', count: 28 },
    { id: 'african', name: 'African', count: 12 }
  ];

  const languages = [
    {
      name: 'English',
      native: 'English',
      code: 'en',
      speakers: '1.5B',
      category: 'popular',
      flag: '🇺🇸',
      accuracy: 99,
      trending: true
    },
    {
      name: 'Spanish',
      native: 'Español',
      code: 'es',
      speakers: '500M',
      category: 'popular',
      flag: '🇪🇸',
      accuracy: 98,
      trending: true
    },
    {
      name: 'French',
      native: 'Français',
      code: 'fr',
      speakers: '280M',
      category: 'european',
      flag: '🇫🇷',
      accuracy: 97,
      trending: false
    },
    {
      name: 'German',
      native: 'Deutsch',
      code: 'de',
      speakers: '100M',
      category: 'european',
      flag: '🇩🇪',
      accuracy: 96,
      trending: false
    },
    {
      name: 'Chinese (Simplified)',
      native: '中文',
      code: 'zh',
      speakers: '1.1B',
      category: 'asian',
      flag: '🇨🇳',
      accuracy: 95,
      trending: true
    },
    {
      name: 'Japanese',
      native: '日本語',
      code: 'ja',
      speakers: '125M',
      category: 'asian',
      flag: '🇯🇵',
      accuracy: 94,
      trending: true
    },
    {
      name: 'Arabic',
      native: 'العربية',
      code: 'ar',
      speakers: '400M',
      category: 'african',
      flag: '🇸🇦',
      accuracy: 93,
      trending: false
    },
    {
      name: 'Portuguese',
      native: 'Português',
      code: 'pt',
      speakers: '260M',
      category: 'popular',
      flag: '🇵🇹',
      accuracy: 97,
      trending: false
    },
    {
      name: 'Russian',
      native: 'Русский',
      code: 'ru',
      speakers: '150M',
      category: 'european',
      flag: '🇷🇺',
      accuracy: 95,
      trending: false
    },
    {
      name: 'Korean',
      native: '한국어',
      code: 'ko',
      speakers: '77M',
      category: 'asian',
      flag: '🇰🇷',
      accuracy: 94,
      trending: true
    },
    {
      name: 'Italian',
      native: 'Italiano',
      code: 'it',
      speakers: '65M',
      category: 'european',
      flag: '🇮🇹',
      accuracy: 96,
      trending: false
    },
    {
      name: 'Hindi',
      native: 'हिन्दी',
      code: 'hi',
      speakers: '600M',
      category: 'asian',
      flag: '🇮🇳',
      accuracy: 92,
      trending: true
    }
  ];

  const filteredLanguages = languages.filter(lang => {
    const matchesSearch = lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lang.native.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || lang.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                100+ Languages
              </span>
              <br />
              At Your Fingertips
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Connect with the world through our comprehensive language support.
              From the most spoken languages to rare dialects, we've got you covered.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                100+
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Languages Supported</h3>
              <p className="text-gray-600">From major world languages to regional dialects</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                99%
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Translation Accuracy</h3>
              <p className="text-gray-600">AI-powered precision for professional quality</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                24/7
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Always Available</h3>
              <p className="text-gray-600">Round-the-clock translation services</p>
            </div>
          </div>
        </div>
      </section>

      {/* Language Browser */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              Browse Our Languages
            </h2>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search languages..."
                  className="pl-10 pr-4 py-3 w-80 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {languageCategories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${selectedCategory === category.id
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Language Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredLanguages.map((language, index) => (
              <div
                key={language.code}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">{language.flag}</div>
                  <div className="flex items-center gap-2">
                    {language.trending && (
                      <div className="flex items-center text-green-500">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">Trending</span>
                      </div>
                    )}
                    <div className="flex items-center text-blue-500">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs font-medium">{language.accuracy}%</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {language.name}
                </h3>
                <p className="text-gray-600 mb-3">
                  {language.native}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{language.speakers} speakers</span>
                  </div>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {language.code}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredLanguages.length === 0 && (
            <div className="text-center py-12">
              <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No languages found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Don't See Your Language?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            We're constantly adding new languages and improving our existing ones.
            Let us know what languages you need most.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
              Request a Language
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300">
              View Roadmap
            </button>
          </div>
        </div>
      </section>


    </div>
  );
};

export default Languages;
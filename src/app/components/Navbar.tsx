'use client'
import React from 'react';
import Link from 'next/link';
import Icon from './Icon';
import ThemeToggle from './ThemeToggle';
export default function Navbar() {
  return (
    <nav className="backdrop-blur-md bg-white/90 dark:bg-gray-900/90 shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Icon />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TranslateHub
            </span>
          </div>

          <div className='flex items-end gap-5'>
            <Link className='font-sans text-lg hover:underline hover:font-semibold' href={'/'}>Home</Link>
            <Link className='font-sans text-lg hover:underline hover:font-semibold' href={'/about'}>About</Link>
            <Link className='font-sans text-lg hover:underline hover:font-semibold' href={'/contact'}>Contact</Link>
            <Link className='font-sans text-lg hover:underline hover:font-semibold' href={'/features'}>Features</Link>
            <Link className='font-sans text-lg hover:underline hover:font-semibold' href={'/languages'}>Languages</Link>
          </div>








          <div className="flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
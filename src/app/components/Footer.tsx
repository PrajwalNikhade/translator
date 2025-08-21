import React from "react";
import { FaPinterestP, FaGithub, FaLinkedinIn } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
// import { HiOutlineNewspaper } from "react-icons/hi";
import Icon from "./Icon";
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
               <Icon/>
              </div>
              <span className="text-2xl font-bold">TranslateHub</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Breaking down language barriers with cutting-edge AI technology. Translate text between 80+ languages with exceptional accuracy and speed.
            </p>
           <div className="flex space-x-4">
  <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
      <FaPinterestP className="w-5 h-5 text-white" />
    </div>
  </a>
  <a href="mailto:support@translatehub.com" target="_blank" rel="noopener noreferrer" aria-label="Gmail">
    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
      <MdEmail className="w-5 h-5 text-white" />
    </div>
  </a>
  <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
      <FaGithub className="w-5 h-5 text-white" />
    </div>
  </a>
  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
      <FaLinkedinIn className="w-5 h-5 text-white" />
    </div>
  </a>
</div>

          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Languages</a></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 Prajwal. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

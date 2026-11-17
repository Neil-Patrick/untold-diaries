import React from "react";
import Link from 'next/link'

const Footer = () => {
  return (
      <footer className="mt-auto text-white px-6 pt-20 md:pt-40 py-10 font-serif">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-purple-400 mb-2">Untold Diaries.</h2>
            <p className="text-sm leading-relaxed">
              Stay anonymous - No names.<br />
              No judgements. Just untold truths and stories.
            </p>
          </div>

          <div className="flex-1">
            <h3 className="text-purple-400 text-lg font-semibold mb-2">Explore</h3>
            <ul className="space-y-1">
              <li><Link href="/" className="hover:text-purple-300">Home</Link></li>
              <li><Link href="/browse" className="hover:text-purple-300">Browse</Link></li>
              <li><Link href="/submit" className="hover:text-purple-300">Submit</Link></li>
            </ul>
          </div>

          <div className="flex-1">
            <h3 className="text-purple-400 text-lg font-semibold mb-2">Designed and Developed by:</h3>
            <div className="flex flex-col sm:flex-row sm:justify-between text-sm space-y-2 sm:space-y-0">
              <div className="space-y-1">
                <p>Gio Andrew Briones</p>
                <p>Nathaniel Segovia</p>
                <p>Neil Patrick Pajadan</p>
              </div>
              <div className="space-y-1 sm:text-left">
                <p>Jannea May Rosal</p>
                <p>Freesia Mae Masakayan</p>
              </div>
            </div>
          </div>
        </div>  
        
        <div className="mt-10 pt-4 text-center text-sm text-gray-400">
          <div className="border-t border-blue-700 max-w-[1400px] mx-auto pb-2" />
          <p className="mt-2">© 2025 Untold Diaries. All rights reserved.</p>
        </div>
      </footer>
    );
  };
  
  export default Footer;
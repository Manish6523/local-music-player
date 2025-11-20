import React from 'react';
import { Search, Home as HomeIcon, Music } from 'lucide-react'; // Import Lucide icons
import { Link } from 'react-router-dom'; // Assuming you have routing enabled

const Navbar = () => {
  return (
    // Redesign: Set height, use flex to align items, and give it a clean dark background
    <header className='h-16 w-full flex items-center justify-between px-8 text-white bg-black/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-20'>
        
        {/* Left Section: Logo/Branding and Navigation */}
        <div className='flex items-center space-x-8'>
            <Link to="/" className='text-lg font-extrabold text-red-500 flex items-center'>
                <Music size={24} className='mr-2'/>
                Music Player
            </Link>

            {/* Main Nav Links (Placeholder) */}
            <nav className='hidden md:flex space-x-6 text-sm font-medium'>
                <Link to="/" className='text-gray-300 hover:text-white transition-colors flex items-center'>
                    <HomeIcon size={18} className='mr-1' /> Home
                </Link>
                <a href="#" className='text-gray-500 hover:text-white transition-colors'>
                    Artists
                </a>
                <a href="#" className='text-gray-500 hover:text-white transition-colors'>
                    Albums
                </a>
            </nav>
        </div>

        {/* Right Section: Search Bar */}
        <div className='flex items-center'>
            <div className='relative'>
                <input
                    type='text'
                    placeholder='Search for music or artists...'
                    className='bg-gray-800 text-gray-200 text-sm py-2 pl-10 pr-4 rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all'
                />
                <Search 
                    size={18} 
                    className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                />
            </div>
        </div>

    </header>
  );
}

export default Navbar;
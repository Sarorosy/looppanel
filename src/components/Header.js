import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const Header = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navigate = useNavigate(); // useNavigate hook for navigation

 

  
  const handleLogout = () => {
    sessionStorage.clear(); // Clear session storage
    navigate('/login')
    
  };
  useEffect(() => {
    const authenticated = sessionStorage.getItem('authenticated');
    
    if (authenticated) {
     
    } else {
      navigate('/login')
    }
  }, []);

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const userData = sessionStorage.getItem('user');

    // Parse the JSON string into an object
    const userObject = JSON.parse(userData);
  const userName = userObject.name;

  const handleNavigation = (path) => {
    setUserMenuOpen(false);
    navigate(path); // useNavigate hook to navigate to the path
  };

  return (
    <header className="bg-blue-400 text-white">
      <div className="mx-auto w-full flex justify-between items-center pnav">
        {/* Logo and Navigation Links */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold mr-6 bg-[#f39c12] py-3 px-2">Query Management</h1>
          <nav className="flex space-x-6">
            <button onClick={() => handleNavigation('/assignquery')} className="">
              Dashboard
            </button>

            
          </nav>
        </div>

        {/* User Session Info */}
        <div className="relative n-dp-dn z-50">
          <button
            onClick={toggleUserMenu}
            className="text-white "
          >
            {userName}
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 bg-white text-black shadow-md border px-2 py-1 sobut">
              <button
                onClick={handleLogout}
                className="block text-left hover:bg-red-400 rounded hover:text-white dropdownmenu"
              >
               <LogOut size={12}/>&nbsp; Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell } from 'lucide-react';
import CustomLoader from '../CustomLoader';
import { AnimatePresence } from 'framer-motion';
import QueryDetails from '../pages/QueryDetails';
import QueryDetailsAdmin from '../pages/QueryDetailsAdmin';

const Header = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0); // State for notification count
  const [notifications, setNotifications] = useState([]); // State for notifications
  const [notificationsVisible, setNotificationsVisible] = useState(false); // To control visibility of notifications dropdown
  const [loading, setLoading] = useState(false); // State for loading spinner
  const [selectedQuery, setSelectedQuery] = useState('');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear();
    window.close();
  };

  const toggleDetailsPage = () => {
    setIsDetailsOpen(!isDetailsOpen);
  };

  useEffect(() => {
    const authenticated = sessionStorage.getItem('authenticated');

    if (!authenticated) {
      navigate('/login');
    }
  }, [navigate]);

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const userData = sessionStorage.getItem('loopuser');
  const userObject = JSON.parse(userData);
  const userName = userObject.fld_first_name;

  const userData2 = sessionStorage.getItem('user');
  const userObject2 = JSON.parse(userData2);

  const handleNavigation = (path) => {
    setUserMenuOpen(false);
    navigate(path);
  };

  const fetchNotificationsCount = async () => {

    try {
      const response = await fetch('https://apacvault.com/Webapi/getNotifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userObject.id }),
      });

      const data = await response.json(); // Parse the response as JSON

      if (data.status) {
        setNotificationCount(data.unread_count);
      } else {
        console.error('Failed to fetch notification count:', data.message);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const handleNotificationClick = async (notificationId, refId) => {

    setSelectedQuery(refId);
    setIsDetailsOpen(true);
    try {
      const response = await fetch('https://apacvault.com/Webapi/readmessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: notificationId,
        }),
      });

      const data = await response.json();
      if (data.status) {
        console.log('Notification marked as read');
        fetchNotificationsCount();
      } else {
        console.error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error while marking notification as read', error);
    }
  };
  const fetchNotifications = async () => {
    setLoading(true); // Show loading spinner
    try {
      const response = await fetch('https://apacvault.com/Webapi/getNotifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userObject.id }),
      });

      const data = await response.json(); // Parse the response as JSON


      if (data.status) {
        setNotifications(data.notifications); // Update notifications state
      } else {
        console.error('Failed to fetch notifications:', data.message);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  useEffect(() => {
    fetchNotificationsCount();
    const interval = setInterval(() => {
      fetchNotificationsCount(); // Fetch count every 5 seconds
    }, 5000);

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  const toggleNotifications = () => {
    setNotificationsVisible(!notificationsVisible);
    if (!notificationsVisible) {
      fetchNotifications(); // Fetch notifications when the dropdown is shown
    }
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
        <div className="relative n-dp-dn z-50 items-center">
          {/* Bell Button with Notification Count */}
          <button onClick={toggleNotifications} className="text-white ml-6 relative">
            <Bell size={24} />
            {notificationCount > 0 && (
              <span className="absolute text-xs bg-red-600 text-white rounded-full px-1 py-0.5" style={{ position:"absolute", top:"-10px",right:"-10px"}}>
                {notificationCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationsVisible && (
            <div className="absolute top-12 right-0 bg-white text-black shadow-lg w-64 border-t-2 border-blue-400 p-3 rounded">
              <h3 className="font-bold mb-2">Notifications</h3>
              {loading ? (
                <CustomLoader />
              ) : notifications.length === 0 ? (
                <p>No notifications</p>
              ) : (
                <div className=' overflow-y-scroll' style={{ height: "200px" }}>
                  <ul>
                    {notifications.map((notification, index) => (
                      <li key={index} className="border-b py-2 cursor-pointer" onClick={() => handleNotificationClick(notification.id, notification.ref_id)}>
                        <p>
                          {notification.fld_first_name} {notification.message} on quotation for ref_id{' '}
                          <strong>{notification.ref_id}</strong>
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* User Menu */}
          <button
            onClick={toggleUserMenu}
            className="text-white ml-6"
          >
            {userName}
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 bg-white text-black shadow-md border px-2 py-1 rounded sobut">
              <button
                onClick={handleLogout}
                className="block text-left hover:bg-red-400 rounded hover:text-white"
              >
                <LogOut size={12} />&nbsp; Sign Out
              </button>
            </div>
          )}
        </div>



      </div>
      <AnimatePresence>
        {isDetailsOpen && (
          userObject2.user_type == "admin" ? (
            <QueryDetailsAdmin
              onClose={toggleDetailsPage}
              queryId={selectedQuery}
            />
          ) : (
            <QueryDetails
              onClose={toggleDetailsPage}
              queryId={selectedQuery}
            />
          )
        )}
      </AnimatePresence>

    </header>
  );
};

export default Header;

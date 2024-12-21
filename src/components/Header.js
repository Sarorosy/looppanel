import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, Quote, MessageSquareMore, MessageSquareText, CircleCheck, BellIcon, CirclePercent, ArrowLeftRight, Hash } from 'lucide-react';
import CustomLoader from '../CustomLoader';
import LogoNew from '../logo-new.png';
import { AnimatePresence } from 'framer-motion';
import QueryDetails from '../pages/QueryDetails';
import QueryDetailsAdmin from '../pages/QueryDetailsAdmin';
import FeasabilityQueryDetails from '../pages/FeasabilityQueryDetails';

const Header = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0); // State for notification count
  const [notifications, setNotifications] = useState([]); // State for notifications
  const [notificationsVisible, setNotificationsVisible] = useState(false); // To control visibility of notifications dropdown
  const [loading, setLoading] = useState(false); // State for loading spinner
  const [selectedQuery, setSelectedQuery] = useState('');
  const [selectedQuote, setSelectedQuote] = useState('');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFeasDetailsOpen, setIsFeasDetailsOpen] = useState(false);

  

  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear();
    window.close();
  };

  const toggleDetailsPage = () => {
    setIsDetailsOpen(!isDetailsOpen);
  };

  const toggleFeasDetailsPage = () => {
    setIsFeasDetailsOpen(!isFeasDetailsOpen);
  };

  const timeAgo = (timestamp) => {
    const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
    const diff = currentTime - timestamp; // Time difference in seconds
  
    const seconds = diff;
    const minutes = Math.floor(diff / 60);
    const hours = Math.floor(diff / 3600);
    const days = Math.floor(diff / 86400);
    const weeks = Math.floor(diff / 604800);
    const months = Math.floor(diff / 2628000);
    const years = Math.floor(diff / 31536000);
  
    if (seconds < 60) return `${seconds} sec ago`;
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days} d ago`;
    if (months < 12) return `${months} month ago`;
    return `${years} year ago`;
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

  const handleNotificationClick = async (notificationId, refId, quoteId, isfeasability, viewer) => {

    setSelectedQuery(refId);
    setSelectedQuote(quoteId)
    if(isfeasability == 0){
      setIsDetailsOpen(true);
    }else{
      if(viewer != null && viewer == 'owner'){
        setIsDetailsOpen(true);
      }else if(viewer!= null && viewer == 'viewer'){
        setIsFeasDetailsOpen(true);
      }
    }

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
      //fetchNotificationsCount(); 
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
    <header className="bg-white text-dark">
      <div className="mx-auto w-full flex justify-between items-center container">
        {/* Logo and Navigation Links */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold mr-6  py-3 px-2">
          <img
          src={LogoNew}
          alt="Company Logo"
          className="nav-logo"
        />
          </h1>

        </div>

        {/* User Session Info */}
        <div className="relative n-dp-dn z-50 items-center flex">
          {/* Bell Button with Notification Count */}
          <button onClick={toggleNotifications} className="text-dark ml-6 relative">
            <Bell size={24} />
            {notificationCount > 0 && (
              <span className="absolute text-xs bg-red-600 text-white rounded-full px-1 py-0.5" style={{ position: "absolute", top: "-10px", right: "-10px" }}>
                {notificationCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationsVisible && (
            <div className="absolute top-12 right-0 bg-white text-black shadow-lg w-72 border-t-2 border-blue-400 py-3 px-1 rounded">
              <h3 className="font-bold mb-2 ml-2">Notifications</h3>
              {loading ? (
                <CustomLoader />
              ) : notifications.length === 0 ? (
                <p>No notifications</p>
              ) : (
                <div className=' overflow-y-scroll' style={{ height: "200px" }}>
                  <ul className='p-1 text-sm'>
                    {notifications.map((notification, index) => (
                      <li key={index} className={`border-b py-1 px-1 my-1 rounded-sm cursor-pointer ${notification.isread == 0 ? 'bg-blue-100' : ''}`} onClick={() => handleNotificationClick(notification.id, notification.ref_id, notification.quote_id, notification.isfeasability, notification.viewer)}>
                        <p className='flex items-center'>
                          {/* Display icon based on notification type */}
                          {notification.icon == 'quote' && (
                            <span className="mr-2">
                              <Quote size={22} className='bg-green-100 text-green-800 rounded-full border-1 p-1 border-green-800'/>
                            </span>
                          )}
                          {notification.icon == 'feasability' && (
                            <span className="mr-2">
                              <i class="fa fa-question bg-orange-100 text-orange-800 rounded-full border-1 p-1 border-orange-800" aria-hidden="true"></i>
                            </span>
                          )}
                          {notification.icon == 'chat' && (
                            <span className="mr-2">
                              <MessageSquareText size={22} className='bg-blue-100 text-blue-800 rounded-full border-1 p-1 border-blue-800'/> 
                            </span>
                          )}
                          {notification.icon == 'tag' && (
                            <span className="mr-2">
                              <Hash size={22} className='bg-blue-100 text-blue-800 rounded-full border-1 p-1 border-blue-800'/>
                            </span>
                          )}
                          {notification.icon == 'completed' && (
                            <span className="mr-2">
                              <CircleCheck size={24} className='bg-green-100 text-green-800 rounded-full'/> {/* Completed icon */}
                            </span>
                          )}
                          {notification.icon == 'transferred' && (
                            <span className="mr-2">
                              <ArrowLeftRight size={26} className='bg-orange-100 text-orange-800 rounded-full border border-orange-600 p-1'/> {/* Completed icon */}
                            </span>
                          )}
                          {notification.icon == 'discount' && (
                            <span className="mr-2">
                              <CirclePercent size={24} className='bg-red-100 text-red-800 rounded-full '/> {/* Completed icon */}
                            </span>
                          )}
                          {(!notification.icon || notification.icon == null) && (
                            <span className="mr-2">
                              <BellIcon size={22}  className='bg-blue-100 text-blue-800 rounded-full border-1 p-1 border-blue-800'/> 
                            </span>
                          )}
                          <span>
                          {notification.fld_first_name} {notification.message} on quotation for ref_id{' '}
                          <strong>{notification.ref_id}</strong>
                          <span className="text-gray-500 text-xs ml-2">
                        {timeAgo(notification.date)} {/* Display time ago */}
                      </span>
                          </span>
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
            className="text-dark ml-6"
          >
            {userName}
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 top-30 mt-2 bg-gray-100 text-black shadow-md border px-2 py-1 rounded sobut">
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
              quotationId={selectedQuote}
            />
          ) : (
            <QueryDetails
              onClose={toggleDetailsPage}
              queryId={selectedQuery}
              quotationId={selectedQuote}
            />
          )
        )}
        {
          isFeasDetailsOpen && (
            <FeasabilityQueryDetails queryId={selectedQuery} quotationId={selectedQuote} onClose={toggleFeasDetailsPage} />
          )
        }
      </AnimatePresence>

    </header>
  );
};

export default Header;

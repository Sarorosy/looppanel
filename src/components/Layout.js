import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import { getSocket } from '../pages/Socket';

const Layout = ({ requestPermission }) => {
  const socket = getSocket();
  const [isConnected, setIsConnected] = useState(false);
  const userData = localStorage.getItem('loopuser');
  const userObject = JSON.parse(userData);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 relative">
      <Header requestPermission={requestPermission} />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-0 py-4">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-200 text-sm py-2 border-t">
        <div className="container mx-auto text-center text-gray-500">
          &copy; {new Date().getFullYear()} Emarketz. All rights reserved.
        </div>
      </footer>

      {/* Socket Indicator */}
      {userObject.id == 1 && (

        <div className="fixed bottom-2 left-2 z-[9999999999999999999999]">
          <div
            className={`h-3 w-3 rounded-full shadow-md ${isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            title={isConnected ? 'Socket Connected' : 'Socket Disconnected'}
          ></div>
        </div>
      )}
    </div>
  );
};

export default Layout;

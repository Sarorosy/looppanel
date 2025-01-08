import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import DecryptPage from "./DecryptPage";
import Layout from './components/Layout';
import ManageContactMadeQueries from "./pages/ManageContactMadeQueries";
import ManageQuery from './pages/ManageQuery';
import './output.css';
import './index.css';
import { getToken } from 'firebase/messaging';
import { messaging } from './firebase-config';
import { onMessage } from 'firebase/messaging';
import { ToastContainer, toast , Slide} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// basename="/askforscope"



function App() {

  const [permissionGranted, setPermissionGranted] = useState(false);
  const userData = sessionStorage.getItem('loopuser');

  const userObject = JSON.parse(userData);

  const requestPermission = async () => {
    try {
      // Check if notification permission is already granted
      const permission = Notification.permission;

      if (permission === 'granted') {
        console.log('Notification permission already granted.');

        // Register the service worker with the correct scope
        if ('serviceWorker' in navigator) {
          // Register the service worker manually with the correct path
          const registration = await navigator.serviceWorker.register('./firebase-messaging-sw.js');
          console.log('Service Worker registered with scope:', registration.scope);

          // Now, get the token with the custom service worker registration
          const currentToken = await getToken(messaging, {
            vapidKey: 'BC3B6_X03H_wgXOz14riIIaW2FDlHr2_LsIVFj_wLhlDtIK4MS53uxlEfJIgQeZvreY8-TsgAhZfpL9YPS5jLn4',  // Your VAPID key here
            serviceWorkerRegistration: registration, // Pass the custom service worker registration
          });

          if (currentToken) {
            console.log('FCM Token:', currentToken);
            const requestData = {
              userId: userObject.id,
              token: currentToken,
            };

            const response = await fetch("https://apacvault.com/webapi/saveFcmToken", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(requestData),
            });

            if (response.ok) {
              const result = await response.json();
              console.log("FCM token successfully saved:", result);
            } else {
              console.error("Failed to save FCM token:", response.status, response.statusText);
            }

          } else {
            console.log('No registration token available.');
          }
        } else {
          console.error('Service Workers are not supported in this browser.');
        }
      } else if (permission === 'default') {
        // Request permission if not already granted
        const permissionRequest = await Notification.requestPermission();
        if (permissionRequest === 'granted') {
          console.log('Notification permission granted.');
          setPermissionGranted(true);
          requestPermission();  // Re-run the permission request logic after granting
        } else {
          console.log('Notification permission denied.');
        }
      } else {
        console.log('Notification permission denied.');
      }

    } catch (error) {
      console.error('Error getting notification permission or token:', error);
    }
};

  useEffect(() => {

    requestPermission();

    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload.notification.body);  // Check this log to see the incoming message
      if (payload && payload.notification) {
        // Handle the notification payload data as needed
        toast(payload.notification.body);
        //alert(payload.data.google.c.a.c_l)
      }
    });
  }, []);

  return (
    <Router >
      <Routes>
        {/* Public route */}
        <Route path="/:email/:token" element={<DecryptPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={<Layout request={requestPermission} />}
        >
          <Route path="/assignquery" element={<ManageContactMadeQueries notification={requestPermission}/>} />
          <Route path="/query" element={<ManageQuery />} />
        </Route>

        {/* Fallback route */}
        {/* <Route path="*" element={<Navigate to="/login" />} /> */}
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={10000}
        hideProgressBar
        newestOnTop
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Slide}
      />
    </Router>
  );
}

export default App;

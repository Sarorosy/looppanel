import React, { useState, useEffect } from 'react';
import ScaleLoader from 'react-spinners/ScaleLoader';

const CustomLoader = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center justify-center">
      {loading && (
        <ScaleLoader
          color="#3498db" // Customize color
          size={25}       // Customize size
          speedMultiplier={2} // Customize speed
        />
      )}
    </div>
  );
};

export default CustomLoader;

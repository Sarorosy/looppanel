import React from "react";
import "./QueryLoader.css"; // Ensure you style as described below

const QueryLoader = () => {
  return (
    <div className="query-loader row px-2 max-w-6xl flex justify-center mx-auto">
      {/* Left: Skeleton Loader for col-md-3 */}
      <div className="skeleton-container col-md-3">
        {[...Array(18)].map((_, index) => (
          <div key={index} className="skeleton skeleton-line"></div>
        ))}
      </div>

      {/* Right: Plain white col-md-9 */}
      <div className="col-md-9 plain-white">
        {[...Array(10)].map((_, index) => (
          <div key={index} className="skeleton skeleton-bar"></div>
        ))}
      </div>
    </div>
  );
};

export default QueryLoader;

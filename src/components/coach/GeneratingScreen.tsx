import React from 'react';

export function GeneratingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-in fade-in duration-500">
      <div className="w-24 h-24 animate-spin">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-blue-500"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray="70 200"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="animate-pulse">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 font-montserrat tracking-widest">
          WAITING...
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 font-inter">
          Creating your personalized AI roadmap
        </p>
      </div>
    </div>
  );
}

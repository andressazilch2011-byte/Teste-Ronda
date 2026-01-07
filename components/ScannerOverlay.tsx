
import React from 'react';

export const ScannerOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div className="relative w-64 h-64 border-2 border-blue-500 rounded-2xl">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
        <div className="absolute top-1/2 left-0 w-full h-1 bg-blue-500/50 animate-pulse"></div>
      </div>
    </div>
  );
};

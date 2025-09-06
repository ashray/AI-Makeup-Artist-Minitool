import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <div className="h-2.5 bg-[repeating-linear-gradient(45deg,#000,#000_10px,#fff_10px,#fff_20px)] border-b border-black"></div>
      <div className="py-8">
        <h1 className="text-4xl font-black text-black uppercase tracking-widest">
          AI Makeup Artist
        </h1>
        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
          Instantly try on any makeup look. Upload your photo and an inspiration pic to see the transformation.
        </p>
      </div>
    </header>
  );
};
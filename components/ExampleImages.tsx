import React from 'react';
import { LoadedExample } from '../App';

interface ExampleImagesProps {
  examples: LoadedExample[];
  onExampleSelect: (name: string) => void;
  isLoading: boolean;
}

const ExampleSkeleton: React.FC = () => (
    <div className="bg-gray-100 p-3 rounded-2xl animate-pulse">
        <div className="flex items-center space-x-3">
            <div className="w-16 h-16 rounded-lg bg-gray-300"></div>
            <div className="font-bold text-3xl text-gray-300">+</div>
            <div className="w-16 h-16 rounded-lg bg-gray-300"></div>
        </div>
        <div className="h-6 w-3/4 bg-gray-300 rounded mt-3"></div>
    </div>
);


export const ExampleImages: React.FC<ExampleImagesProps> = ({ examples, onExampleSelect, isLoading }) => {
  return (
    <div>
      <h3 className="text-xl font-bold text-center text-black mb-1">Start with an Example</h3>
      <p className="text-center text-gray-600 mb-4">Select a look to see a one-click transformation.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            <ExampleSkeleton />
            <ExampleSkeleton />
            <ExampleSkeleton />
          </>
        ) : (
            examples.map((example) => (
            <button
              key={example.name}
              onClick={() => onExampleSelect(example.name)}
              className="group block text-left bg-gray-50 border border-gray-200 p-3 rounded-2xl shadow-sm hover:border-red-500 hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <div className="flex items-center space-x-3">
                <img src={example.selfie.base64} alt={`${example.name} selfie`} className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow-md"/>
                <div className="font-bold text-3xl text-gray-300">+</div>
                <img src={example.makeup.base64} alt={`${example.name} makeup look`} className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow-md"/>
              </div>
              <p className="font-bold text-black mt-3">{example.name}</p>
            </button>
            ))
        )}
      </div>
    </div>
  );
};
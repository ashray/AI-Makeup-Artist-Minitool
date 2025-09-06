import React from 'react';
import { Spinner } from './Spinner';
import { MakeupRecommendation } from '../App';
import { RecommendationsTable } from './RecommendationsTable';

interface ResultDisplayProps {
  isLoading: boolean;
  generatedImage: string | null;
  error: string | null;
  isRecommendationsLoading: boolean;
  recommendations: MakeupRecommendation[] | null;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ isLoading, generatedImage, error, isRecommendationsLoading, recommendations }) => {
  if (isLoading) {
    return (
      <div className="w-full bg-gray-50 border border-gray-200 p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center min-h-[300px] lg:min-h-[400px]">
        <Spinner />
        <p className="text-black mt-4 text-lg">AI is working its magic...</p>
        <p className="text-gray-600 text-sm">This can take a moment.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-red-50 border border-red-300 text-red-700 p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center min-h-[300px] lg:min-h-[400px]">
        <h3 className="text-xl font-bold mb-2">An Error Occurred</h3>
        <p className="text-center">{error}</p>
      </div>
    );
  }

  if (generatedImage) {
    return (
      <div className="w-full bg-gray-50 border border-gray-200 p-6 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold text-black mb-4 text-center">Your New Look!</h2>
        <div className="flex justify-center mb-8">
            <img 
                src={generatedImage} 
                alt="Generated makeup look" 
                className="rounded-xl shadow-lg max-w-full h-auto"
                style={{maxHeight: '70vh'}}
            />
        </div>

        {isRecommendationsLoading && (
            <div className="flex items-center justify-center text-gray-600">
                <Spinner />
                <p className="ml-3">Generating your custom tutorial...</p>
            </div>
        )}
        
        {recommendations && (
            <div>
                <h3 className="text-2xl font-bold text-black mb-4 text-center">How to Get The Look</h3>
                <RecommendationsTable recommendations={recommendations} />
            </div>
        )}

      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 border border-gray-200 p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center min-h-[300px] lg:min-h-[400px]">
      <p className="text-gray-500 text-center">Your generated image will appear here once you apply the makeup.</p>
    </div>
  );
};
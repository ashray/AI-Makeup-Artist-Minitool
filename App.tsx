import React, { useState, useCallback, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { applyMakeup, getMakeupRecommendations } from './services/geminiService';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ExampleImages } from './components/ExampleImages';

export interface ImageData {
  file: File;
  base64: string;
}

export interface MakeupRecommendation {
  facePart: string;
  improvement: string;
  importance: 'High' | 'Normal' | 'Optional' | string;
  products: string;
  sephoraLink: string;
}

export interface LoadedExample {
  name: string;
  selfie: ImageData;
  makeup: ImageData;
}

interface ExampleConfig {
  name: string;
  selfie: string;
  makeup: string;
}

const examples: ExampleConfig[] = [
  {
    name: 'Natural Glow',
    selfie: 'examples/selfie1.jpg',
    makeup: 'examples/makeup1.jpg',
  },
  {
    name: 'Smokey Eye',
    selfie: 'examples/selfie2.jpg',
    makeup: 'examples/makeup2.jpg',
  },
  {
    name: 'Bridal Glow',
    selfie: 'examples/selfie3.jpg',
    makeup: 'examples/makeup3.jpg',
  },
];

const urlToImageData = async (url: string, fileName: string): Promise<ImageData> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from ${url}. Make sure it exists in the /public folder.`);
  }
  const blob = await response.blob();
  
  // Robust MIME type detection
  let mimeType = blob.type;
  if (!mimeType || mimeType === 'application/octet-stream') {
    const extension = url.split('.').pop()?.toLowerCase();
    if (extension === 'jpg' || extension === 'jpeg') {
      mimeType = 'image/jpeg';
    } else if (extension === 'png') {
      mimeType = 'image/png';
    } else if (extension === 'webp') {
      mimeType = 'image/webp';
    }
  }

  const file = new File([blob], fileName, { type: mimeType });

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({ file, base64: reader.result as string });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};


const App: React.FC = () => {
  const [selfie, setSelfie] = useState<ImageData | null>(null);
  const [makeupLook, setMakeupLook] = useState<ImageData | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<MakeupRecommendation[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExampleLoading, setIsExampleLoading] = useState<boolean>(true);
  const [loadedExamples, setLoadedExamples] = useState<LoadedExample[]>([]);
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllExamples = async () => {
        try {
            const data = await Promise.all(
                examples.map(async (ex) => {
                    const [selfie, makeup] = await Promise.all([
                        urlToImageData(ex.selfie, `${ex.name}-selfie.jpg`),
                        urlToImageData(ex.makeup, `${ex.name}-makeup.jpg`),
                    ]);
                    return { name: ex.name, selfie, makeup };
                })
            );
            setLoadedExamples(data);
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : "Could not load example images.");
        } finally {
            setIsExampleLoading(false);
        }
    };
    fetchAllExamples();
  }, []);

  const handleApplyMakeup = useCallback(async () => {
    if (!selfie || !makeupLook) {
      setError("Please upload both a selfie and a makeup look image.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setRecommendations(null);

    try {
      // Generate the image first
      const imageResult = await applyMakeup(selfie, makeupLook);
      if (imageResult) {
        setGeneratedImage(`data:image/jpeg;base64,${imageResult}`);
        
        // After image is generated, fetch recommendations
        setIsRecommendationsLoading(true);
        try {
          const recs = await getMakeupRecommendations(makeupLook);
          setRecommendations(recs);
        } catch (recError) {
          console.error("Failed to get recommendations:", recError);
          // Non-critical error, so we don't block the UI
        } finally {
          setIsRecommendationsLoading(false);
        }

      } else {
        setError("The AI could not generate an image. Please try different images.");
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [selfie, makeupLook]);

  const handleExampleSelect = useCallback((exampleName: string) => {
    const selected = loadedExamples.find(ex => ex.name === exampleName);
    if (selected) {
        setSelfie(selected.selfie);
        setMakeupLook(selected.makeup);
    }
  }, [loadedExamples]);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        
        <ExampleImages 
          examples={loadedExamples} 
          onExampleSelect={handleExampleSelect} 
          isLoading={isExampleLoading} 
        />

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-base font-medium text-gray-500">
              OR
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ImageUploader
            id="selfie-uploader"
            title="1. Upload Your Selfie"
            description="Only a clear, front-facing photo works. If you upload an image that is not a selfie, it will not work."
            onImageSelect={setSelfie}
            imageData={selfie}
          />
          <ImageUploader
            id="makeup-uploader"
            title="2. Upload Makeup Look"
            description="Choose a high-quality inspiration photo."
            onImageSelect={setMakeupLook}
            imageData={makeupLook}
          />
        </div>

        <div className="text-center mb-8">
          <button
            onClick={handleApplyMakeup}
            disabled={!selfie || !makeupLook || isLoading || isExampleLoading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-10 rounded-full text-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:scale-100"
          >
            {isLoading ? 'Applying Makeup...' : 'Apply Makeup'}
          </button>
        </div>
        
        <ResultDisplay
            isLoading={isLoading}
            generatedImage={generatedImage}
            error={error}
            isRecommendationsLoading={isRecommendationsLoading}
            recommendations={recommendations}
        />
      </main>
      <Footer />
    </div>
  );
};

export default App;
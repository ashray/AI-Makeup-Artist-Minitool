import React, { useCallback, useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { ClearIcon } from './icons/ClearIcon';

interface ImageData {
  file: File;
  base64: string;
}

interface ImageUploaderProps {
  id: string;
  title: string;
  description: string;
  onImageSelect: (data: ImageData | null) => void;
  imageData: ImageData | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ id, title, description, onImageSelect, imageData }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect({ file, base64: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onImageSelect(null);
    if (inputRef.current) {
        inputRef.current.value = "";
    }
  }, [onImageSelect]);
  
  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-red-500');
    const file = event.dataTransfer.files?.[0];
     if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect({ file, base64: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);
  
  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.currentTarget.classList.add('border-red-500');
  };

  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-red-500');
  };


  return (
    <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl shadow-sm h-full flex flex-col">
      <h2 className="text-xl font-bold text-black mb-2">{title}</h2>
      <p className="text-gray-600 mb-4 text-sm">{description}</p>
      <div className="flex-grow">
        <input
          type="file"
          id={id}
          ref={inputRef}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
        />
        <label
          htmlFor={id}
          className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-red-500 transition-colors duration-300 relative aspect-square"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {imageData ? (
            <>
              <img src={imageData.base64} alt="Preview" className="object-cover w-full h-full rounded-xl" />
              <button
                onClick={handleClear}
                className="absolute top-2 right-2 bg-white/60 p-2 rounded-full text-black hover:bg-white/90 backdrop-blur-sm transition-all duration-300"
                aria-label="Clear image"
              >
                <ClearIcon />
              </button>
            </>
          ) : (
            <div className="text-center text-gray-600 p-4">
              <UploadIcon />
              <p className="mt-2 font-semibold">Click to upload or drag & drop</p>
              <p className="text-xs">PNG, JPG, or WEBP</p>
            </div>
          )}
        </label>
      </div>
    </div>
  );
};

import React, { useRef, useState } from 'react';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
    onImageUpload: (file: File) => void;
    imagePreview: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, imagePreview }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            onImageUpload(file);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, dragging: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(dragging);
    }
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            onImageUpload(file);
        }
    }

    return (
        <div className="w-full">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
            <div
                onClick={handleClick}
                onDragEnter={(e) => handleDragEvents(e, true)}
                onDragLeave={(e) => handleDragEvents(e, false)}
                onDragOver={(e) => handleDragEvents(e, true)}
                onDrop={handleDrop}
                className={`relative w-full aspect-video rounded-lg border-2 border-dashed border-gray-600 flex flex-col justify-center items-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-indigo-400 bg-gray-700/50' : 'hover:border-gray-500'}`}
            >
                {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg p-1" />
                ) : (
                    <div className="text-center text-gray-400 p-4">
                        <UploadIcon className="w-12 h-12 mx-auto mb-2 text-gray-500" />
                        <p className="font-semibold">Click to upload or drag & drop</p>
                        <p className="text-sm">PNG, JPG, WEBP, etc.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageUploader;

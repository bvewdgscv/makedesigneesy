import React from 'react';
import { ImageIcon, WarningIcon, DownloadIcon } from './icons';

interface OutputDisplayProps {
    outputImage: string | null;
    outputText: string | null;
    isLoading: boolean;
    error: string | null;
    hasOriginal: boolean;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center text-center text-gray-400 h-full">
         <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-400"></div>
         <p className="mt-4 text-lg font-semibold">AI is thinking...</p>
         <p className="text-sm">This can take a moment.</p>
    </div>
);

const Placeholder: React.FC = () => (
    <div className="flex flex-col items-center justify-center text-center text-gray-500 h-full">
        <ImageIcon className="w-16 h-16 mb-4" />
        <p className="text-lg font-semibold">Your generated result will appear here.</p>
        <p className="text-sm">Upload an image and select a transformation to get started.</p>
    </div>
);

const OutputDisplay: React.FC<OutputDisplayProps> = ({ outputImage, outputText, isLoading, error, hasOriginal }) => {
    
    const handleDownload = () => {
        if (outputImage) {
            const link = document.createElement('a');
            link.href = outputImage;
            
            const mimeTypeMatch = outputImage.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
            const extension = mimeTypeMatch && mimeTypeMatch.length > 1 ? mimeTypeMatch[1].split('/')[1] : 'png';
            link.download = `generated-image.${extension}`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (outputText) {
            const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'generated-text.txt';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const hasOutput = (outputImage || outputText) && !isLoading && !error;

    const renderContent = () => {
        if (isLoading) {
            return <LoadingSpinner />;
        }
        if (error) {
            return (
                <div className="flex flex-col items-center justify-center text-center text-red-400 h-full">
                    <WarningIcon className="w-16 h-16 mb-4" />
                    <p className="text-lg font-semibold">An Error Occurred</p>
                    <p className="text-sm max-w-sm">{error}</p>
                </div>
            );
        }
        if (outputImage) {
            return <img src={outputImage} alt="Generated output" className="w-full h-full object-contain rounded-lg" />;
        }
        if (outputText) {
            return (
                <div className="p-4 bg-gray-900 rounded-lg h-full overflow-y-auto">
                    <p className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">{outputText}</p>
                </div>
            );
        }
        if (hasOriginal) {
             return (
                <div className="flex flex-col items-center justify-center text-center text-gray-500 h-full">
                    <ImageIcon className="w-16 h-16 mb-4" />
                    <p className="text-lg font-semibold">Ready to Generate</p>
                    <p className="text-sm">Hit the "Generate" button to see the magic.</p>
                </div>
             )
        }
        return <Placeholder />;
    };

    return (
        <div className="w-full aspect-video rounded-lg bg-gray-900 flex justify-center items-center p-2 relative border border-gray-700">
            {renderContent()}
            {hasOutput && (
                 <button
                    onClick={handleDownload}
                    className="absolute top-3 right-3 p-2 bg-gray-800/60 backdrop-blur-sm text-gray-300 rounded-full hover:bg-gray-700/80 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    aria-label="Download output"
                    title="Download output"
                >
                    <DownloadIcon className="w-5 h-5" />
                </button>
            )}
        </div>
    );
};

export default OutputDisplay;
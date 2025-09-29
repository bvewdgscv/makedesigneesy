
import React from 'react';
import { SparklesIcon } from './icons';

const Header: React.FC = () => {
    return (
        <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
            <div className="container mx-auto px-4 md:px-8 py-4">
                <div className="flex items-center gap-3">
                    <SparklesIcon className="w-8 h-8 text-indigo-400" />
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
                        AI Image Transformer
                    </h1>
                </div>
            </div>
        </header>
    );
};

export default Header;

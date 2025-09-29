import React from 'react';
import { TransformationType, TRANSFORMATION_MODELS } from '../types';
import { ArtIcon, DepthIcon, TextIcon, WandIcon, SparklesIcon, ChevronDownIcon, ExtractIcon, GraphicFormatIcon } from './icons';

interface ControlPanelProps {
    selected: TransformationType;
    onSelect: (type: TransformationType) => void;
    selectedModel: string;
    onModelChange: (model: string) => void;
    onGenerate: () => void;
    isDisabled: boolean;
}

const transformationOptions = [
    { type: TransformationType.LINE_ART, label: "Line Art", icon: ArtIcon },
    { type: TransformationType.DEPTH_MAP, label: "Depth Map", icon: DepthIcon },
    { type: TransformationType.VARIATION, label: "Variation", icon: WandIcon },
    { type: TransformationType.DESCRIPTION, label: "Description", icon: TextIcon },
    { type: TransformationType.EXTRACTION_FORMAT, label: "Extraction", icon: ExtractIcon },
    { type: TransformationType.GRAPHIC_FORMAT, label: "Graphic Format", icon: GraphicFormatIcon },
];

const ControlPanel: React.FC<ControlPanelProps> = ({ selected, onSelect, selectedModel, onModelChange, onGenerate, isDisabled }) => {
    const availableModels = TRANSFORMATION_MODELS[selected];

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {transformationOptions.map(({ type, label, icon: Icon }) => (
                    <button
                        key={type}
                        onClick={() => onSelect(type)}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${
                            selected === type
                                ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300'
                                : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                        }`}
                    >
                        <Icon className="w-6 h-6" />
                        <span>{label}</span>
                    </button>
                ))}
            </div>

            {availableModels.length > 1 && (
                <div className="relative">
                    <label htmlFor="model-select" className="block text-sm font-medium text-gray-400 mb-1">AI Model</label>
                    <select
                        id="model-select"
                        value={selectedModel}
                        onChange={(e) => onModelChange(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-3 pr-8 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 appearance-none"
                        aria-label="Select AI Model"
                    >
                        {availableModels.map(model => (
                            <option key={model} value={model}>
                                {model}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 top-6 flex items-center px-2 text-gray-400">
                       <ChevronDownIcon className="h-5 w-5" />
                    </div>
                </div>
            )}

            <button
                onClick={onGenerate}
                disabled={isDisabled}
                className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 hover:bg-indigo-500 disabled:bg-gray-500 disabled:cursor-not-allowed transform hover:scale-105 active:scale-100 disabled:scale-100 mt-2"
            >
                <SparklesIcon className="w-5 h-5"/>
                {isDisabled ? 'Generating...' : 'Generate'}
            </button>
        </div>
    );
};

export default ControlPanel;
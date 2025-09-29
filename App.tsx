import React, { useState, useCallback, useEffect } from 'react';
import { TransformationType, TRANSFORMATION_MODELS } from './types';
import { generateImageTransformation, generateTextDescription, generateImageFromPrompt } from './services/geminiService';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ControlPanel from './components/ControlPanel';
import OutputDisplay from './components/OutputDisplay';

const App: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<File | null>(null);
    const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
    const [selectedTransformation, setSelectedTransformation] = useState<TransformationType>(TransformationType.LINE_ART);
    const [selectedModel, setSelectedModel] = useState<string>(TRANSFORMATION_MODELS[selectedTransformation][0]);
    const [outputImage, setOutputImage] = useState<string | null>(null);
    const [outputText, setOutputText] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Reset to the default model when the transformation type changes
        setSelectedModel(TRANSFORMATION_MODELS[selectedTransformation][0]);
    }, [selectedTransformation]);

    const handleImageUpload = (file: File) => {
        setOriginalImage(file);
        setOutputImage(null);
        setOutputText(null);
        setError(null);
        const reader = new FileReader();
        reader.onloadend = () => {
            setOriginalImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                // remove the header: 'data:image/png;base64,'
                resolve(result.split(',')[1]);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleGenerate = useCallback(async () => {
        if (!originalImage) {
            setError("Please upload an image first.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setOutputImage(null);
        setOutputText(null);

        try {
            const base64Data = await fileToBase64(originalImage);
            const mimeType = originalImage.type;

            switch (selectedTransformation) {
                case TransformationType.LINE_ART:
                    const lineArt = await generateImageTransformation(base64Data, mimeType, "Extract the clean, black and white line art from this image. The background should be pure white. Focus on the main contours and outlines.");
                    setOutputImage(lineArt);
                    break;
                case TransformationType.DEPTH_MAP:
                    const depthMap = await generateImageTransformation(base64Data, mimeType, "Generate a monocular depth map for this image. Closer objects should be lighter, and farther objects should be darker. Provide a grayscale image representing depth.");
                    setOutputImage(depthMap);
                    break;
                case TransformationType.VARIATION:
                    if (selectedModel === 'imagen-4.0-generate-001') {
                        // Image-to-Text-to-Image workflow
                        const descriptionPrompt = "Describe this image for a text-to-image AI. Focus on the main subject, style, and key visual elements.";
                        const imageDescription = await generateTextDescription(base64Data, mimeType, descriptionPrompt);
                        
                        const variationPrompt = `A creative artistic variation based on this description: "${imageDescription}". Reimagine it in a completely different style.`;
                        const variation = await generateImageFromPrompt(variationPrompt);
                        setOutputImage(variation);
                    } else {
                        // Standard image-to-image workflow
                        const variation = await generateImageTransformation(base64Data, mimeType, "Generate a creative artistic variation of this image. Reimagine it in a completely different style, like a vibrant watercolor painting or a futuristic synthwave poster.");
                        setOutputImage(variation);
                    }
                    break;
                case TransformationType.DESCRIPTION:
                    const description = await generateTextDescription(base64Data, mimeType, "Analyze the provided image and describe the prominent patterns, textures, and repeating visual elements in detail.");
                    setOutputText(description);
                    break;
                case TransformationType.EXTRACTION_FORMAT:
                    const extractionPrompt = "Analyze the provided image and describe its graphical format and style. Identify the key artistic elements, color palette, composition, and any distinct visual techniques used.";
                    const extraction = await generateTextDescription(base64Data, mimeType, extractionPrompt);
                    setOutputText(extraction);
                    break;
                case TransformationType.GRAPHIC_FORMAT:
                    const graphicFormatPrompt = "Analyze the provided image and describe its technical graphic format details. Identify potential file type (e.g., JPEG, PNG), compression characteristics (lossy/lossless), color space (e.g., RGB), bit depth, and whether it uses transparency. Suggest optimal use cases based on these properties (e.g., web, print).";
                    const graphicFormat = await generateTextDescription(base64Data, mimeType, graphicFormatPrompt);
                    setOutputText(graphicFormat);
                    break;
                default:
                    throw new Error("Invalid transformation type");
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [originalImage, selectedTransformation, selectedModel]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            <Header />
            <main className="container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Panel */}
                    <div className="flex flex-col gap-6 p-6 bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
                        <h2 className="text-2xl font-bold text-indigo-400">1. Upload Image</h2>
                        <ImageUploader onImageUpload={handleImageUpload} imagePreview={originalImagePreview} />
                        
                        {originalImagePreview && (
                            <>
                                <h2 className="text-2xl font-bold text-indigo-400 mt-4">2. Choose Transformation</h2>
                                <ControlPanel
                                    selected={selectedTransformation}
                                    onSelect={setSelectedTransformation}
                                    selectedModel={selectedModel}
                                    onModelChange={setSelectedModel}
                                    onGenerate={handleGenerate}
                                    isDisabled={isLoading}
                                />
                            </>
                        )}
                    </div>

                    {/* Right Panel */}
                    <div className="flex flex-col gap-6 p-6 bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
                         <h2 className="text-2xl font-bold text-indigo-400">3. View Result</h2>
                        <OutputDisplay
                            outputImage={outputImage}
                            outputText={outputText}
                            isLoading={isLoading}
                            error={error}
                            hasOriginal={!!originalImage}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
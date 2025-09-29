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
    const [prompt, setPrompt] = useState<string>("A highly detailed, photorealistic wooden circular carving, approximately 24 inches in diameter, placed on a dark, polished antique wooden table. The carving depicts an intricate floral and scrollwork mandala design, featuring a prominent central rose surrounded by layers of delicate petals, leaves, and swirling tendrils, all deeply carved into light-brown, finely-grained wood. The relief should show subtle variations in depth, giving it a natural, handcrafted appearance, with smooth, slightly reflective surfaces that catch the ambient light. The background of the carving should have a fine, stippled texture that contrasts with the smooth, raised elements. Subtle shadows should fall across the carved details, enhancing the three-dimensional effect. The overall lighting should be soft and warm, highlighting the texture and depth of the wood. Include some subtle dust motes floating in the air near the carving for added realism.");
    const [selectedTransformation, setSelectedTransformation] = useState<TransformationType>(TransformationType.TEXT_TO_IMAGE);
    const [selectedModel, setSelectedModel] = useState<string>(TRANSFORMATION_MODELS[selectedTransformation][0]);
    const [intensity, setIntensity] = useState<number>(5);
    const [outputImage, setOutputImage] = useState<string | null>(null);
    const [outputText, setOutputText] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Reset to the default model when the transformation type changes
        setSelectedModel(TRANSFORMATION_MODELS[selectedTransformation][0]);
        setOutputImage(null);
        setOutputText(null);
        setError(null);
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
        if (selectedTransformation === TransformationType.TEXT_TO_IMAGE) {
            if (!prompt) {
                setError("Please enter a prompt.");
                return;
            }
        } else if (!originalImage) {
            setError("Please upload an image first.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setOutputImage(null);
        setOutputText(null);

        try {
            if (selectedTransformation === TransformationType.TEXT_TO_IMAGE) {
                const result = await generateImageFromPrompt(prompt);
                setOutputImage(result);
                return; 
            }
            
            const base64Data = await fileToBase64(originalImage!);
            const mimeType = originalImage!.type;

            const getIntensityLabel = (value: number): string => {
                if (value <= 3) return 'a subtle, low amount of';
                if (value <= 7) return 'a moderate amount of';
                return 'a strong, high amount of';
            };

            const getAbstractionLevel = (value: number): string => {
                if (value <= 3) return 'subtly, keeping most original details';
                if (value <= 7) return 'moderately, balancing abstraction and original form';
                return 'in a highly abstract way, using only basic shapes';
            };

            switch (selectedTransformation) {
                case TransformationType.LINE_ART:
                    const lineArt = await generateImageTransformation(base64Data, mimeType, "Extract the clean, black and white line art from this image. The background should be pure white. Focus on the main contours and outlines.");
                    setOutputImage(lineArt);
                    break;
                case TransformationType.RELIEF_MODEL:
                    const reliefMap = await generateImageTransformation(base64Data, mimeType, "Generate a high-contrast, detailed grayscale depth map for this image, suitable for creating a 3D bas-relief model for STL generation. Lighter areas should represent higher elevation (closer to the viewer), and darker areas should represent lower elevation (further from the viewer). The output should be a clean image optimized for 3D displacement.");
                    setOutputImage(reliefMap);
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
                case TransformationType.LOGO:
                    const logoPrompt = "Analyze the provided image and generate a clean, modern, vector-style logo based on its key elements and themes (like nature, adventure, contemplation). Then, place this generated logo as a small, tasteful watermark in the bottom-right corner of the original image. The final output should be the original image with the new logo added.";
                    const logo = await generateImageTransformation(base64Data, mimeType, logoPrompt);
                    setOutputImage(logo);
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
                case TransformationType.CLARITY_BOOST:
                    const clarityIntensity = getIntensityLabel(intensity);
                    const clarityBoost = await generateImageTransformation(base64Data, mimeType, `Enhance the clarity and sharpness of this image. Apply ${clarityIntensity} enhancement. Reduce blur and bring out fine details. The output should be a clearer version of the original photo.`);
                    setOutputImage(clarityBoost);
                    break;
                case TransformationType.PATTERNIZE:
                    const patternIntensity = getIntensityLabel(intensity);
                    const pattern = await generateImageTransformation(base64Data, mimeType, `Analyze the prominent patterns and textures in this image and generate a seamless, tileable pattern based on them. The pattern should capture the essence of the original image's design with ${patternIntensity} detail and complexity.`);
                    setOutputImage(pattern);
                    break;
                case TransformationType.GEOMETRIZE:
                    const geometrizationLevel = getAbstractionLevel(intensity);
                    const geometrization = await generateImageTransformation(base64Data, mimeType, `Simplify this image into a composition of geometric shapes and solid colors. Represent the main subject and overall structure ${geometrizationLevel}.`);
                    setOutputImage(geometrization);
                    break;
                default:
                    throw new Error("Invalid transformation type");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [originalImage, selectedTransformation, selectedModel, prompt, intensity]);

    const isGenerateDisabled = isLoading || (selectedTransformation === TransformationType.TEXT_TO_IMAGE ? !prompt : !originalImage);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            <Header />
            <main className="container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Panel */}
                    <div className="flex flex-col gap-6 p-6 bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
                        <h2 className="text-2xl font-bold text-indigo-400">1. Choose Transformation</h2>
                         <ControlPanel
                            selected={selectedTransformation}
                            onSelect={(type) => {
                                setSelectedTransformation(type);
                                setIntensity(5); // Reset intensity on new selection
                            }}
                            selectedModel={selectedModel}
                            onModelChange={setSelectedModel}
                            onGenerate={handleGenerate}
                            isDisabled={isGenerateDisabled}
                            intensity={intensity}
                            onIntensityChange={setIntensity}
                        />
                        
                        <h2 className="text-2xl font-bold text-indigo-400 mt-2">
                            {selectedTransformation === TransformationType.TEXT_TO_IMAGE ? '2. Enter Prompt' : '2. Upload Image'}
                        </h2>
                        {selectedTransformation === TransformationType.TEXT_TO_IMAGE ? (
                             <div className="w-full">
                                <textarea
                                    id="prompt-input"
                                    rows={10}
                                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg py-3 px-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 resize-y leading-relaxed"
                                    placeholder="e.g., A futuristic city at sunset, with flying cars..."
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    disabled={isLoading}
                                    aria-label="Image generation prompt"
                                />
                            </div>
                        ) : (
                            <ImageUploader onImageUpload={handleImageUpload} imagePreview={originalImagePreview} />
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
                            hasOriginal={!!(originalImage || prompt)}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
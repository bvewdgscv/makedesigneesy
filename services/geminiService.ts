import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * A centralized error handler that inspects API errors and creates a more
 * user-friendly and specific error message.
 * @param error The error caught from the API call.
 * @param context A string describing the action that failed (e.g., "generating image").
 * @throws {Error} Throws a new error with a user-friendly message.
 */
const handleApiError = (error: unknown, context: string): never => {
    console.error(`Error during ${context}:`, error);
    let userMessage = `An unexpected error occurred while ${context}. Please try again.`;

    if (error instanceof Error) {
        const lowerCaseMessage = error.message.toLowerCase();
        if (lowerCaseMessage.includes("api key not valid")) {
            userMessage = "API key is not valid. Please check your configuration.";
        } else if (lowerCaseMessage.includes("safety settings") || lowerCaseMessage.includes("blocked")) {
            userMessage = "Your request was blocked due to safety settings. Please modify your prompt or image and try again.";
        } else if (lowerCaseMessage.includes("network") || lowerCaseMessage.includes("fetch")) {
            userMessage = "A network error occurred. Please check your connection and try again.";
        } else if (lowerCaseMessage.includes("no image was generated")) {
            userMessage = "The model did not return an image. It might have responded with text. Please adjust your prompt.";
        } else if (lowerCaseMessage.includes("refused the request")) {
            userMessage = "The model refused to process the request, which can happen with prompts that violate safety policies.";
        }
    }
    
    throw new Error(userMessage);
};


export async function generateImageTransformation(base64ImageData: string, mimeType: string, prompt: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            }
        }

        throw new Error("No image was generated. The model might have responded with text only.");

    } catch (error) {
        handleApiError(error, "transforming the image");
    }
}

export async function generateTextDescription(base64ImageData: string, mimeType: string, prompt: string): Promise<string> {
    try {
        const imagePart = {
            inlineData: {
                mimeType: mimeType,
                data: base64ImageData,
            },
        };
        const textPart = {
            text: prompt
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        return response.text;
    } catch (error) {
        handleApiError(error, "generating the text description");
    }
}

export async function generateImageFromPrompt(prompt: string): Promise<string> {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '1:1',
            },
        });

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    } catch (error) {
        handleApiError(error, "generating the image from your prompt");
    }
}
import { GoogleGenAI, Modality, GenerateContentResponse, Type } from '@google/genai';
import { ImageData, MakeupRecommendation } from '../App';

// Ensure you have your API key in an environment variable
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToBase64 = (base64DataUrl: string): string => {
    return base64DataUrl.split(',')[1];
};

export const applyMakeup = async (selfie: ImageData, makeupLook: ImageData): Promise<string | null> => {
    try {
        const model = 'gemini-2.5-flash-image-preview';

        const selfiePart = {
            inlineData: {
                mimeType: selfie.file.type,
                data: fileToBase64(selfie.base64),
            },
        };

        const makeupLookPart = {
            inlineData: {
                mimeType: makeupLook.file.type,
                data: fileToBase64(makeupLook.base64),
            },
        };

        const prompt = {
            text: "I have uploaded 2 pictures. Your goal is to create an image of the person in the first picture, wearing the same make up as the person in the second picture. Carefully analyse both images. Make sure that the lip color, the eye make up, the blush shade etc are all retained from the reference image (the second picture). Apply that make up to the person in the first picture. Do not change anything else except for the make-up in the image.",
        };

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [selfiePart, makeupLookPart, prompt],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        if (response.candidates && response.candidates.length > 0) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    return part.inlineData.data;
                }
            }
        }
        
        return null;

    } catch (error) {
        console.error('Error calling Gemini API for image generation:', error);
        throw new Error('Failed to generate image with Gemini API.');
    }
};


export const getMakeupRecommendations = async (makeupLook: ImageData): Promise<MakeupRecommendation[] | null> => {
    try {
        const model = 'gemini-2.5-flash';

        const makeupLookPart = {
            inlineData: {
                mimeType: makeupLook.file.type,
                data: fileToBase64(makeupLook.base64),
            },
        };

        const prompt = "You are a professional makeup artist. Analyze the makeup look in the provided image. Your task is to provide a detailed, step-by-step guide on how to achieve this look for the following face parts: Foundation, Concealer, Contour, Blush, Highlighter, Lipstick, Lipgloss, Eyeliner, Mascara, Eye shadow. For each part, describe the technique or improvement needed, classify its importance (High, Normal, or Optional), suggest possible product types, and generate a search link for that product type on Sephora.com. The link MUST be in the format 'https://www.sephora.com/search?keyword={query}', where {query} is a URL-encoded search term for the product. Respond ONLY with the JSON object that adheres to the provided schema.";

        const responseSchema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    facePart: { type: Type.STRING, description: "The part of the face (e.g., 'Foundation', 'Eyeliner')." },
                    improvement: { type: Type.STRING, description: "The technique or improvement to be done." },
                    importance: { type: Type.STRING, description: "Importance level: 'High', 'Normal', or 'Optional'." },
                    products: { type: Type.STRING, description: "Types of beauty products to achieve the look." },
                    sephoraLink: { type: Type.STRING, description: "A search link to Sephora.com in the format 'https://www.sephora.com/search?keyword={query}'." },
                },
                required: ['facePart', 'improvement', 'importance', 'products', 'sephoraLink'],
            },
        };

        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [makeupLookPart, {text: prompt}] },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonStr = response.text.trim();
        const data = JSON.parse(jsonStr);

        return data as MakeupRecommendation[];

    } catch (error) {
        console.error('Error calling Gemini API for recommendations:', error);
        throw new Error('Failed to get makeup recommendations from Gemini API.');
    }
};
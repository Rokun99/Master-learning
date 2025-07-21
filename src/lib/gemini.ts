
import { GoogleGenAI, Type, Content } from "@google/genai";
import { JournalEntry, DnaReportData, Feedback } from "../storage";

// The vite.config.ts file defines process.env.API_KEY from VITE_GEMINI_API_KEY.
const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not defined. Please check your environment variables.");
}

const ai = new GoogleGenAI({ apiKey });

interface Idea {
    title: string;
    description: string;
}

/**
 * Gets a chat response from the AI.
 * @param history The chat history.
 * @param systemInstruction The system instruction for the AI.
 * @returns The AI's response text.
 */
export async function getAiChatResponse(history: Content[], systemInstruction: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: history,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        return response.text ?? '';
    } catch (error) {
        console.error("Error getting AI chat response:", error);
        throw new Error("Failed to get response from AI.");
    }
}

/**
 * Generates creative ideas based on a prompt.
 * @param prompt The prompt to generate ideas for.
 * @returns A list of ideas with titles and descriptions.
 */
export async function generateIdeas(prompt: string): Promise<Idea[]> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: {
                                type: Type.STRING,
                                description: 'The short, catchy title of the idea.',
                            },
                            description: {
                                type: Type.STRING,
                                description: 'A brief description of the creative idea.',
                            },
                        },
                        required: ['title', 'description'],
                    },
                },
            },
        });
        const text = response.text?.trim();
        if (!text) return [];
        return JSON.parse(text) as Idea[];
    } catch (error) {
        console.error("Error generating ideas:", error);
        throw new Error("Failed to generate ideas from AI.");
    }
}

/**
 * Gets structured feedback on a conversation.
 * @param prompt The combined prompt including context and system instruction.
 * @returns Structured feedback.
 */
export async function getStructuredFeedback(prompt: string): Promise<Feedback> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        like: { type: Type.STRING },
                        wish: { type: Type.STRING },
                        whatIf: { type: Type.STRING },
                    },
                    required: ['like', 'wish', 'whatIf'],
                },
            },
        });
        const text = response.text?.trim();
        if (!text) throw new Error("AI returned empty feedback.");
        return JSON.parse(text) as Feedback;
    } catch (error) {
        console.error("Error getting structured feedback:", error);
        throw new Error("Failed to get structured feedback from AI.");
    }
}

/**
 * Generates an image for a prompt.
 * @param prompt The combined prompt for the image.
 * @returns A base64 encoded image string.
 */
export async function generateImageForPrompt(prompt: string): Promise<string> {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });

        const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;

        if (base64ImageBytes) {
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        
        throw new Error("No image was generated or image data is missing.");
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image from AI.");
    }
}

/**
 * Generates a Creative DNA report from a text prompt.
 * @param prompt The combined prompt including all journal entries and system instructions.
 * @returns The structured DNA report data.
 */
export async function generateDnaReport(prompt: string): Promise<Omit<DnaReportData, 'generatedAt'>> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        archetype: {
                            type: Type.OBJECT,
                            properties: { name: { type: Type.STRING }, description: { type: Type.STRING } },
                            required: ['name', 'description'],
                        },
                        themes: { type: Type.ARRAY, items: { type: Type.STRING } },
                        breakthrough: {
                            type: Type.OBJECT,
                            properties: { day: { type: Type.INTEGER }, quote: { type: Type.STRING } },
                            required: ['day', 'quote'],
                        },
                        pathForward: { type: Type.ARRAY, items: { type: Type.STRING } },
                        wordCloud: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: { text: { type: Type.STRING }, value: { type: Type.NUMBER } },
                                required: ['text', 'value'],
                            },
                        },
                    },
                    required: ['archetype', 'themes', 'breakthrough', 'pathForward', 'wordCloud'],
                },
            },
        });
        const text = response.text?.trim();
        if (!text) throw new Error("AI returned an empty DNA report.");
        return JSON.parse(text) as Omit<DnaReportData, 'generatedAt'>;
    } catch (error) {
        console.error("Error generating DNA report:", error);
        throw new Error("Failed to generate DNA report from AI.");
    }
}

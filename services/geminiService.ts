import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ChatMessage, ThinkingData, GroundingSource } from '../types';
import { SYSTEM_PROMPT } from '../constants';

// This is a mock API key. In a real environment, it would be a secret.
// As per instructions, we assume process.env.API_KEY is available.
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using a placeholder. This will fail.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY || "YOUR_API_KEY" });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const base64ToGenerativePart = (base64: string, mimeType: string = 'image/jpeg') => {
  return {
    inlineData: {
      data: base64,
      mimeType: mimeType,
    },
  };
};

export const getVisualResponse = async (
  prompt: string,
  history: ChatMessage[],
  imageBase64?: string
): Promise<{ images: string[]; thinking: ThinkingData, groundingSources?: GroundingSource[] }> => {
  
  // 1. Get reasoning and prompts from Gemini 2.5 Flash
  const reasoningModel = 'gemini-2.5-flash';
  
  const contents = [
    ...history.flatMap(msg => {
      const parts = (msg.images && msg.images.length > 0)
        ? [{ text: msg.text }, base64ToGenerativePart(msg.images[0])]
        : [{ text: msg.text }];
      return { role: msg.role, parts };
    }),
    { 
      role: 'user', 
      parts: imageBase64 
        ? [{ text: prompt }, base64ToGenerativePart(imageBase64)] 
        : [{ text: prompt }]
    }
  ];

  const reasoningResponse = await ai.models.generateContent({
    model: reasoningModel,
    contents: contents,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      tools: [{googleSearch: {}}],
      // responseMimeType and responseSchema are not supported with tools.
      // The system prompt still instructs the model to return JSON.
    }
  });

  let thinkingText = reasoningResponse.text.trim();
  
  // The model might wrap the JSON in markdown code fences. We need to strip them.
  const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = thinkingText.match(jsonRegex);
  if (match && match[1]) {
    thinkingText = match[1];
  }

  const thinking: ThinkingData = JSON.parse(thinkingText);

  // Extract grounding sources if they exist
  const groundingChunks = reasoningResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
  const groundingSources: GroundingSource[] = groundingChunks
    ?.map((chunk: any) => ({
      uri: chunk.web?.uri || '',
      title: chunk.web?.title || 'Untitled Source',
    }))
    .filter((source: GroundingSource) => source.uri);


  if (!thinking.prompts || thinking.prompts.length === 0) {
    // If there are no prompts but there are sources, it might be a text-only answer from search.
    // For this app, we will treat it as an inability to visualize.
    if(groundingSources && groundingSources.length > 0) {
        // We can create a "thinking" object that explains this.
        const fallbackThinking: ThinkingData = {
            interpretation: thinking.interpretation || `The user asked about "${prompt}".`,
            visualApproach: "I found information using Google Search, but I was unable to create a suitable visual representation for it. The information is better suited for a text response.",
            prompts: [],
            styleConsiderations: thinking.styleConsiderations || "N/A"
        }
        return { images: [], thinking: fallbackThinking, groundingSources };
    }
    throw new Error("Reasoning model did not return any prompts for image generation.");
  }

  // 2. Generate images using Gemini 2.5 Flash Image (nano banana)
  const imageModel = 'gemini-2.5-flash-image';
  const imagePromises = thinking.prompts.map(p => 
    ai.models.generateContent({
      model: imageModel,
      contents: { parts: [{ text: p }] },
      config: {
        responseModalities: [Modality.IMAGE],
      }
    })
  );

  const imageResponses = await Promise.all(imagePromises);

  const images: string[] = imageResponses.map(res => {
    const part = res.candidates?.[0]?.content?.parts?.[0];
    if (part && part.inlineData) {
      return part.inlineData.data;
    }
    // Allow for partial success, filter out failed generations
    return ''; 
  }).filter(img => img);
  
  return { images, thinking, groundingSources };
};
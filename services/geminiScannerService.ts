
import { GoogleGenAI, Type } from "@google/genai";
import { Language } from "../translations";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeScanQuality(images: string[], lang: Language = 'es') {
  const model = 'gemini-3-flash-preview';
  
  const imageParts = images.slice(0, 3).map(img => ({
    inlineData: {
      mimeType: 'image/jpeg',
      data: img.split(',')[1]
    }
  }));

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        ...imageParts,
        { text: `Analyze these frames from a dental plaster model scan. Check for: 1. Visibility of ArUco markers for scale. 2. Sharpness of the cervical margins. 3. Lighting consistency. 
        IMPORTANT: Return the "feedback" string in ${lang === 'es' ? 'Spanish' : lang === 'pt' ? 'Portuguese' : 'English'}.
        Return a JSON with qualityScore (0-100), feedback (string), and missingAngles (array of numbers if any).` }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          qualityScore: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          missingAngles: { 
            type: Type.ARRAY,
            items: { type: Type.NUMBER }
          }
        },
        required: ["qualityScore", "feedback"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateTechBrief() {
  const model = 'gemini-3-pro-preview';
  const response = await ai.models.generateContent({
    model,
    contents: "Explain the photogrammetry pipeline for a dental plaster model using ArUco markers for 1:1 scale calibration. Focus on STL export for Exocad."
  });
  return response.text;
}

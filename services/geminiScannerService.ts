
import { GoogleGenAI, Type } from "@google/genai";
import { Language } from "../translations";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeScanQuality(images: string[], lang: Language = 'es') {
  const model = 'gemini-3.5-flash';
  
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
        { text: `Strict clinical validation of dental plaster model scan. 
        You MUST verify that the captured target in the images is genuinely:
        A) A dental plaster model / cast (upper dental arch or lower dental arch of teeth).
        OR B) A bite registration (physically assembled upper and lower dental arches with silicone/wax registration).
        AND C) Centered and aligned inside the anatomical guide silhouette / physical ArUco grid-base sheet.

        If the image contains:
        - Arbitrary objects (cups, landscape, faces, keyboards, fingers, etc.)
        - A generic room with no dental models
        - Handheld items that are NOT dental plaster casts
        Then you MUST set isDentalSubject to false.

        IMPORTANT: Return the "feedback" string in ${lang === 'es' ? 'Spanish (es)' : lang === 'pt' ? 'Portuguese (pt)' : 'English (en)'}.
        Provide feedback explaining why the validation failed or succeeded, mentioning anatomical details (e.g., cervical margins, molar alignment, bite silicone, or non-dental object spotted).
        
        Return a JSON schema with:
        - isDentalSubject (boolean): True only if the images contain actual dental casts/models/bite.
        - meshLocked (boolean): True if the structure aligns with the margins/grid.
        - qualityScore (number): 0 to 100.
        - feedback (string): explanation in the target language.` }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isDentalSubject: { type: Type.BOOLEAN },
          meshLocked: { type: Type.BOOLEAN },
          qualityScore: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          missingAngles: { 
            type: Type.ARRAY,
            items: { type: Type.NUMBER }
          }
        },
        required: ["isDentalSubject", "meshLocked", "qualityScore", "feedback"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateTechBrief() {
  const model = 'gemini-3.5-flash';
  const response = await ai.models.generateContent({
    model,
    contents: "Explain the photogrammetry pipeline for a dental plaster model using ArUco markers for 1:1 scale calibration. Focus on STL export for Exocad."
  });
  return response.text;
}

import { GoogleGenAI } from "@google/genai";
import { ArtStyle, AssetType, GenerationConfig } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const STYLE_PROMPTS: Record<ArtStyle, string> = {
  pixel: "16-bit pixel art style, crisp edges, limited color palette, retro game asset",
  vector: "Clean flat vector illustration, adobe illustrator style, bold lines, solid colors, svg style",
  realistic: "Photorealistic 2D render, high detail, unreal engine 5 render, raytraced",
  sketch: "Hand drawn pencil sketch on paper, artistic, rough lines",
  blueprint: "Technical blueprint schematic, white lines on blue background, engineering drawing",
  neon: "Cyberpunk neon aesthetics, glowing lights, dark background, synthwave style"
};

const TYPE_PROMPTS: Record<AssetType, string> = {
  car: "A top-down view of a drag racing car. The car should be facing vertically (up or down). Symmetrical design.",
  track: "A top-down view of a race track segment. Asphalt texture, lane markings.",
  prop: "A top-down view of a race track prop (like a cone, tire barrier, or flag).",
  ui: "A user interface element for a racing game."
};

export const generateAsset = async (config: GenerationConfig): Promise<string> => {
  const { prompt, type, style, aspectRatio } = config;

  const systemContext = `
    You are an expert game artist specializing in creating 2D assets for top-down racing games.
    Create an image based on the following requirements:
    1. Viewpoint: STRICTLY TOP-DOWN (Bird's eye view).
    2. Background: Solid plain color (white or black) ensuring easy removal. Ideally isolated.
    3. Subject: ${TYPE_PROMPTS[type]}
    4. Style: ${STYLE_PROMPTS[style]}
    5. Specific details: ${prompt}
    
    Ensure the asset is centered and fully visible within the frame.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: systemContext,
          },
        ],
      },
      config: {
        imageConfig: {
            aspectRatio: aspectRatio,
        }
      },
    });

    // Extract image from response parts
    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const base64EncodeString: string = part.inlineData.data;
          // Determine mime type if possible, defaulting to png as per API behavior usually
          const mimeType = part.inlineData.mimeType || 'image/png';
          return `data:${mimeType};base64,${base64EncodeString}`;
        }
      }
    }

    throw new Error("No image data found in response");
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw new Error(error.message || "Failed to generate asset");
  }
};

import { GoogleGenAI } from "@google/genai";
import { ArtStyle, AssetType, GenerationConfig } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const STYLE_PROMPTS: Record<ArtStyle, string> = {
  pixel: "16-bit pixel art style, crisp edges, limited color palette, retro game asset",
  vector: "Clean flat vector illustration, adobe illustrator style, bold lines, solid colors, svg style",
  realistic: "Photorealistic 2D render, high detail, unreal engine 5 render, raytraced",
  sketch: "Hand drawn pencil sketch on paper, artistic, rough lines",
  blueprint: "Technical blueprint schematic, white lines on blue background, engineering drawing",
  neon: "Cyberpunk neon aesthetics, glowing lights, dark background, synthwave style",
  lowpoly: "Low poly 3D style, flat shading, sharp geometric shapes, PlayStation 1 aesthetic",
  celshaded: "Cel-shaded, anime style, bold outlines, toon shading, vibrant colors",
  vaporwave: "Vaporwave aesthetic, pink and blue gradients, grid lines, retro 80s computer graphics",
  watercolor: "Watercolor painting style, soft edges, artistic, paper texture",
  oil: "Oil painting style, textured brush strokes, rich colors",
  marker: "Alcohol marker drawing, Copic style, vibrant, hand-drawn design"
};

const TYPE_PROMPTS: Record<AssetType, string> = {
  car: "A drag racing car. Symmetrical design.",
  track: "A race track segment. Asphalt texture, lane markings.",
  prop: "A race track prop (like a cone, tire barrier, or flag).",
  ui: "A user interface element for a racing game."
};

const PERSPECTIVE_PROMPTS: Record<string, string> = {
  'top-down': "STRICTLY TOP-DOWN (Bird's eye view), completely flat 2D looking down.",
  'isometric': "2.5D Isometric Game View (approx 45 degrees), showing depth and side details.",
  'side': "Direct Side Profile View (flat 2D side view), showing the full length of the car.",
  'front': "Direct Front View (Head-on), showing the grille and headlights.",
  'rear': "Direct Rear View, showing the taillights and exhaust."
};

export const generateAsset = async (config: GenerationConfig): Promise<string> => {
  const { prompt, type, style, aspectRatio, perspective } = config;

  const viewpointDescription = PERSPECTIVE_PROMPTS[perspective] || PERSPECTIVE_PROMPTS['top-down'];

  const systemContext = `
    You are an expert game artist specializing in creating 2D assets for racing games.
    Create an image based on the following requirements:
    1. Viewpoint: ${viewpointDescription}
    2. Background: Transparent. The subject must be perfectly isolated on a transparent background with no background elements or solid colors.
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
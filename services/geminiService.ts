import { GoogleGenAI } from "@google/genai";
import { ArtStyle, AssetType, GenerationConfig, WheelWellDetail } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const STYLE_PROMPTS: Record<ArtStyle, string> = {
  pixel: "16-bit pixel art style, crisp edges, limited color palette, retro game asset, no anti-aliasing, transparent-ready",
  vector: "Clean flat vector illustration, adobe illustrator style, bold lines, solid colors, svg style, high contrast isolation",
  realistic: "Photorealistic 2D render, high detail, unreal engine 5 render, isolated studio lighting",
  sketch: "Hand drawn pencil sketch on paper, artistic, rough lines, white paper background",
  blueprint: "Technical blueprint schematic, white lines on blue background, engineering drawing",
  neon: "Cyberpunk neon aesthetics, glowing lights, dark background, synthwave style",
  lowpoly: "Low poly 3D style, flat shading, sharp geometric shapes, PlayStation 1 aesthetic, isolated",
  celshaded: "Cel-shaded, anime style, bold outlines, toon shading, vibrant colors, isolated",
  vaporwave: "Vaporwave aesthetic, pink and blue gradients, grid lines, retro 80s computer graphics",
  watercolor: "Watercolor painting style, soft edges, artistic, paper texture, white background",
  oil: "Oil painting style, textured brush strokes, rich colors",
  marker: "Alcohol marker drawing, Copic style, vibrant, hand-drawn design, white background"
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
  'front': "Direct Front View (Head-on), showing the grille, headlights, and VERY VISIBLE front tires with realistic camber.",
  'rear': "Direct Rear View, showing the taillights, exhaust, and VERY VISIBLE wide rear drag tires.",
};

const WHEEL_WELL_DETAIL_PROMPTS: Record<WheelWellDetail, string> = {
  basic: "The wheel wells should be simple, dark, and shadowed voids behind the tires.",
  rotors: "Inside the wheel wells, render high-performance drilled and slotted brake rotors with large, visible multi-piston brake calipers.",
  full: "Inside the wheel wells, provide full mechanical detail: large brake rotors, brightly colored calipers, visible coilover suspension, springs, and control arms."
};

/**
 * Extracts base64 data from a data URL
 */
const getBase64FromDataUrl = (dataUrl: string) => {
  return dataUrl.split(',')[1];
};

export const generateAsset = async (config: GenerationConfig): Promise<string> => {
  const { prompt, type, style, aspectRatio, perspective, hexColor, renderWheelWells, wheelWellDetail, groundShadow } = config;

  const viewpointDescription = PERSPECTIVE_PROMPTS[perspective] || PERSPECTIVE_PROMPTS['top-down'];
  const colorConstraint = hexColor 
    ? `COLOR LOCK: The primary paint/body color MUST be EXACTLY the hex color ${hexColor}.` 
    : "";

  const maskingInstruction = renderWheelWells && perspective === 'side' 
    ? `WHEEL MASKING: ${WHEEL_WELL_DETAIL_PROMPTS[wheelWellDetail || 'basic']} This area must be fully rendered so it is not transparent if wheels are removed.` 
    : "";

  const shadowInstruction = groundShadow 
    ? "GROUNDING: Include a subtle, clean black 'shadow box' or contact shadow beneath the vehicle to ground it." 
    : "";

  const systemContext = `
    You are an expert game artist. Create a high-definition 2D game asset.
    
    STRICT BACKGROUND RULE: Place the subject on a SOLID, FLAT, PURE BLACK (#000000) background. 
    This is absolutely critical for perfect chroma-key transparency removal. Ensure:
    - NO shadows cast onto the background unless the groundShadow box is requested.
    - NO glowing effects or gradients bleeding into the background.
    - NO white outlines or anti-aliasing against the black edge.
    - Clear, sharp boundaries between the asset and the black void.
    
    1. Viewpoint: ${viewpointDescription}
    2. Subject: ${TYPE_PROMPTS[type]}
    3. Style: ${STYLE_PROMPTS[style]}
    4. ${colorConstraint}
    5. ${maskingInstruction}
    6. ${shadowInstruction}
    7. Specific details: ${prompt}
    
    The asset should be centered, fully visible, and not cropped.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: systemContext }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        }
      },
    });

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

export const generateAssetWithReference = async (
  referenceImageUrl: string,
  targetPerspective: string,
  basePerspective: string,
  config: GenerationConfig
): Promise<string> => {
  const { prompt, type, style, aspectRatio, hexColor, renderWheelWells, wheelWellDetail, groundShadow } = config;
  const targetViewpointDesc = PERSPECTIVE_PROMPTS[targetPerspective];
  const baseViewpointDesc = PERSPECTIVE_PROMPTS[basePerspective];
  
  const maskingInstruction = renderWheelWells && targetPerspective === 'side' 
    ? `WHEEL MASKING: ${WHEEL_WELL_DETAIL_PROMPTS[wheelWellDetail || 'basic']}` 
    : "";

  const shadowInstruction = groundShadow 
    ? "Include ground contact shadow box." 
    : "";

  const systemContext = `
    Reference the provided image. Generate an EXACT visual duplicate of this ${type} from a ${targetViewpointDesc} perspective.
    
    STRICT BACKGROUND RULE: Use a SOLID, FLAT, PURE BLACK (#000000) background. NO SHADOWS, NO GLOW, NO WHITE OUTLINES.
    
    ${maskingInstruction}
    ${shadowInstruction}

    Maintain EXACT body kit, wheels, and decals. 
    ${hexColor ? `Force paint color to HEX ${hexColor}.` : "Maintain reference colors."}
    
    Style: ${STYLE_PROMPTS[style]}
    Details: ${prompt}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: getBase64FromDataUrl(referenceImageUrl),
            },
          },
          { text: systemContext },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        }
      },
    });

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
    console.error("Gemini Consistency Generation Error:", error);
    throw new Error(error.message || "Failed to generate consistent variant");
  }
};
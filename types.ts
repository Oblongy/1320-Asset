export type AssetType = 'car' | 'track' | 'prop' | 'ui';

export type ArtStyle = 'pixel' | 'vector' | 'realistic' | 'sketch' | 'blueprint' | 'neon' | 'lowpoly' | 'celshaded' | 'vaporwave' | 'watercolor' | 'oil' | 'marker';

export interface GeneratedAsset {
  id: string;
  imageUrl: string;
  prompt: string;
  type: AssetType;
  style: ArtStyle;
  timestamp: number;
}

export interface GenerationConfig {
  prompt: string;
  type: AssetType;
  style: ArtStyle;
  aspectRatio: '1:1' | '3:4' | '4:3' | '16:9' | '9:16';
  perspective: 'top-down' | 'isometric' | 'side' | 'front' | 'rear';
  hexColor?: string;
}

export interface GenerationError {
  message: string;
}
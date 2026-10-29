export type AspectRatio = '16:9' | '9:16' | '1:1';

export type MusicTheme = 'luxury_ambient' | 'modern_acoustic' | 'cinematic_elegance' | 'upbeat_urban' | 'none';

export interface PropertyImage {
  id: string;
  url: string;
  label: string; // e.g. "Living Room", "Master Suite", "Modular Kitchen", "Balcony View", "Exterior"
  caption?: string;
  isCustom?: boolean;
}

export interface PropertyDetails {
  propertyName: string;
  propertyType: string; // e.g. "2-BHK Luxury Apartment", "Modern Villa", "Penthouse", "Studio"
  location: string;
  price: string;
  bedrooms?: string;
  bathrooms?: string;
  areaSqft?: string;
  keyFeatures: string[];
  contactText: string;
  contactPhone?: string;
  contactEmail?: string;
  images: PropertyImage[];
}

export type SceneType = 'intro' | 'feature' | 'outro';

export interface Scene {
  id: string;
  type: SceneType;
  title: string;
  subtitle: string;
  badgeText?: string;
  caption: string;
  voiceoverScript: string;
  imageIndex: number; // Index of image in images array
  durationSec: number;
  motion: {
    startScale: number;
    endScale: number;
    startX: number;
    endX: number;
    startY: number;
    endY: number;
  };
}

export interface VideoProject {
  details: PropertyDetails;
  aspectRatio: AspectRatio;
  targetDurationSec: number;
  musicTheme: MusicTheme;
  musicVolume: number; // 0 to 1
  voiceVolume: number; // 0 to 1
  enableVoiceover: boolean;
  enableMusic: boolean;
  scenes: Scene[];
  fullScript: string;
  accentColor: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

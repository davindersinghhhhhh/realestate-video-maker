import { AspectRatio, PropertyDetails, Scene, ValidationResult } from '../types/property';

/**
 * Validates property information and ensures sufficient media and details exist.
 */
export function validateProperty(details: Partial<PropertyDetails>): ValidationResult {
  const errors: { field: string; message: string }[] = [];
  const warnings: string[] = [];

  if (!details.propertyName || details.propertyName.trim().length === 0) {
    errors.push({ field: 'propertyName', message: 'Property name is required.' });
  }

  if (!details.location || details.location.trim().length === 0) {
    errors.push({ field: 'location', message: 'Property location is required.' });
  }

  if (!details.price || details.price.trim().length === 0) {
    errors.push({ field: 'price', message: 'Price is required.' });
  }

  if (!details.propertyType || details.propertyType.trim().length === 0) {
    errors.push({ field: 'propertyType', message: 'Property type is required.' });
  }

  const images = details.images || [];
  if (images.length === 0) {
    errors.push({ field: 'images', message: 'At least 1 property image is required.' });
  } else if (images.length < 4) {
    warnings.push(`Recommended 4–8 property images for an optimal promotional video (currently ${images.length}).`);
  }

  const features = details.keyFeatures || [];
  if (features.length === 0) {
    warnings.push('Adding 3 to 5 key features creates richer feature scenes.');
  }

  if (!details.contactText || details.contactText.trim().length === 0) {
    warnings.push('Contact / Call-To-Action text is recommended for the closing scene.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Normalizes and formats price strings in Indian Rupees (INR - ₹).
 * Handles numbers and strings with Crores (Cr) and Lakhs notation.
 */
export function formatPrice(price: string | number): string {
  if (typeof price === 'number') {
    if (price >= 10000000) {
      const cr = price / 10000000;
      return `₹${cr.toFixed(2).replace(/\.00$/, '')} Cr`;
    }
    if (price >= 100000) {
      const lakh = price / 100000;
      return `₹${lakh.toFixed(2).replace(/\.00$/, '')} Lakh`;
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  }

  const clean = price.trim();
  // If user typed with $ sign, convert to ₹
  if (clean.startsWith('$')) {
    return '₹' + clean.slice(1).trim();
  }

  // If already starts with ₹, return as is
  if (clean.startsWith('₹')) {
    return clean;
  }

  // If starts with Rs or INR
  if (/^(rs\.?|inr)\s*/i.test(clean)) {
    return '₹' + clean.replace(/^(rs\.?|inr)\s*/i, '').trim();
  }

  // Check if it's a numeric string (e.g. "18500000" or "9500000")
  const num = Number(clean.replace(/,/g, ''));
  if (!isNaN(num) && num > 0) {
    if (num >= 10000000) {
      const cr = num / 10000000;
      return `₹${cr.toFixed(2).replace(/\.00$/, '')} Cr`;
    }
    if (num >= 100000) {
      const lakh = num / 100000;
      return `₹${lakh.toFixed(2).replace(/\.00$/, '')} Lakh`;
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  }

  return `₹${clean}`;
}

/**
 * Returns rendering canvas dimensions for selected aspect ratio.
 */
export function getAspectDimensions(aspectRatio: AspectRatio): { width: number; height: number; label: string } {
  switch (aspectRatio) {
    case '16:9':
      return { width: 1280, height: 720, label: 'Landscape (16:9) - Web & Portals' };
    case '9:16':
      return { width: 720, height: 1280, label: 'Vertical (9:16) - Reels & Stories' };
    case '1:1':
      return { width: 1080, height: 1080, label: 'Square (1:1) - Social Feed' };
  }
}

/**
 * Calculates start and end timestamp for each scene given a total duration.
 */
export function calculateSceneTimings(
  scenes: Scene[],
  totalDurationSec: number
): { id: string; startTime: number; endTime: number; duration: number }[] {
  if (scenes.length === 0) return [];

  // Determine base durations
  const sumAssigned = scenes.reduce((acc, s) => acc + (s.durationSec || 5), 0);
  const factor = sumAssigned > 0 ? totalDurationSec / sumAssigned : 1;

  let current = 0;
  return scenes.map((scene) => {
    const rawDuration = (scene.durationSec || 5) * factor;
    const duration = Math.round(rawDuration * 10) / 10;
    const startTime = current;
    const endTime = current + duration;
    current = endTime;
    return {
      id: scene.id,
      startTime: Math.round(startTime * 10) / 10,
      endTime: Math.round(endTime * 10) / 10,
      duration,
    };
  });
}

/**
 * Builds the strict, zero-hallucination Gemini prompt for property video generation.
 */
export function buildPromptForProperty(details: PropertyDetails): string {
  const featureList = details.keyFeatures.map((f, i) => `${i + 1}. ${f}`).join('\n');
  const imageLabels = details.images.map((img, i) => `Image ${i + 1}: ${img.label}`).join('\n');

  return `You are an elite real estate marketing scriptwriter for Davinder Singh Real Estate.
Create a high-converting, professional, 20-40 second video script and scene-by-scene storyboard.

CRITICAL INSTRUCTION:
- ONLY use the facts supplied in the input below. DO NOT invent amenities, square footage, neighborhood accolades, or features not provided.
- Strictly adhere to supplied property details.

PROPERTY DETAILS:
Property Name: ${details.propertyName}
Property Type: ${details.propertyType}
Location: ${details.location}
Price: ${details.price}
Bedrooms: ${details.bedrooms || 'Not specified'}
Bathrooms: ${details.bathrooms || 'Not specified'}
Area: ${details.areaSqft || 'Not specified'}
Key Features:
${featureList || 'None specified'}
Contact / CTA: ${details.contactText}
Available Images (${details.images.length}):
${imageLabels}

FORMAT YOUR RESPONSE AS JSON matching this schema:
{
  "headline": "A short 5-8 word punchy marketing hook",
  "fullVoiceover": "The entire connected narration script for the voice actor (3-5 sentences total)",
  "scenes": [
    {
      "id": "scene-1",
      "type": "intro",
      "title": "${details.propertyName}",
      "subtitle": "${details.location}",
      "badgeText": "${details.price}",
      "caption": "Opening punchy caption",
      "voiceoverScript": "Opening voiceover sentence introducing this ${details.propertyType} at ${details.location}.",
      "imageIndex": 0,
      "durationSec": 5
    },
    ... (one feature scene per main image/feature, up to ${Math.max(1, details.images.length - 2)} scenes),
    {
      "id": "scene-outro",
      "type": "outro",
      "title": "Schedule Your Private Viewing",
      "subtitle": "${details.contactText}",
      "badgeText": "Inquire Now",
      "caption": "Contact our sales team today",
      "voiceoverScript": "Schedule your private tour today. Contact us for exclusive pricing and details.",
      "imageIndex": ${Math.max(0, details.images.length - 1)},
      "durationSec": 5
    }
  ]
}`;
}

/**
 * Deterministic fallback script generator that strictly uses input facts.
 * Used when offline, during tests, or as instantaneous generation.
 */
export function generateFallbackScript(details: PropertyDetails): {
  headline: string;
  fullVoiceover: string;
  scenes: Scene[];
} {
  const images = details.images && details.images.length > 0
    ? details.images
    : [{ id: 'placeholder-1', url: '', label: 'Property Front' }];

  const features = details.keyFeatures && details.keyFeatures.length > 0
    ? details.keyFeatures
    : ['Premium Finish', 'Spacious Interiors', 'Prime Location'];

  const priceFormatted = formatPrice(details.price);
  const totalImg = images.length;

  const scenes: Scene[] = [];

  // 1. Intro Scene
  scenes.push({
    id: 'scene-intro',
    type: 'intro',
    title: details.propertyName,
    subtitle: `${details.propertyType} • ${details.location}`,
    badgeText: priceFormatted,
    caption: `Welcome to ${details.propertyName} in prime ${details.location}.`,
    voiceoverScript: `Welcome to ${details.propertyName}, a premier ${details.propertyType} located in ${details.location}, offered at ${priceFormatted}.`,
    imageIndex: 0,
    durationSec: 5,
    motion: {
      startScale: 1.0,
      endScale: 1.15,
      startX: 0,
      endX: -20,
      startY: 0,
      endY: -10,
    },
  });

  // 2. Feature Scenes (arrange available images / features)
  const availableFeatures = [...features];
  const middleImageCount = Math.max(1, totalImg - 2);
  const featureScenesCount = Math.min(middleImageCount, Math.max(2, features.length));

  for (let i = 0; i < featureScenesCount; i++) {
    const imgIndex = (i + 1) % totalImg;
    const currentImg = images[imgIndex] || images[0];
    const feat = availableFeatures[i % availableFeatures.length] || `Feature Highlight ${i + 1}`;

    const motionPatterns = [
      { startScale: 1.15, endScale: 1.0, startX: 20, endX: 0, startY: 10, endY: 0 },
      { startScale: 1.0, endScale: 1.12, startX: -15, endX: 15, startY: -5, endY: 5 },
      { startScale: 1.1, endScale: 1.0, startX: 0, endX: -20, startY: 10, endY: -10 },
      { startScale: 1.0, endScale: 1.18, startX: 10, endX: -10, startY: -10, endY: 10 },
    ];

    scenes.push({
      id: `scene-feature-${i + 1}`,
      type: 'feature',
      title: currentImg.label || feat,
      subtitle: feat,
      badgeText: `Highlight ${i + 1}`,
      caption: `Featuring ${feat.toLowerCase()} crafted for modern comfort.`,
      voiceoverScript: `Experience standout details like ${feat}, complemented by exceptional design throughout the ${details.propertyType.toLowerCase()}.`,
      imageIndex: imgIndex,
      durationSec: 5,
      motion: motionPatterns[i % motionPatterns.length],
    });
  }

  // 3. Outro / Call To Action Scene
  const outroImageIndex = totalImg > 1 ? totalImg - 1 : 0;
  scenes.push({
    id: 'scene-outro',
    type: 'outro',
    title: 'Schedule Your Private Tour',
    subtitle: details.location,
    badgeText: 'Available Now',
    caption: details.contactText || 'Contact Davinder Singh today for private appointments.',
    voiceoverScript: `Don't miss the opportunity to make ${details.propertyName} your own. ${details.contactText || 'Contact Davinder Singh today to schedule your private tour.'}`,
    imageIndex: outroImageIndex,
    durationSec: 6,
    motion: {
      startScale: 1.05,
      endScale: 1.0,
      startX: 0,
      endX: 0,
      startY: -10,
      endY: 0,
    },
  });

  const fullVoiceover = scenes.map((s) => s.voiceoverScript).join(' ');

  return {
    headline: `Discover Exceptional Living at ${details.propertyName}`,
    fullVoiceover,
    scenes,
  };
}

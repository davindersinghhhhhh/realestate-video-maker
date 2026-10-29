import { PropertyDetails, PropertyImage, Scene } from '../types/property';
import { SAMPLE_PROPERTIES } from '../data/sampleProperties';

export interface SearchResultItem {
  id: string;
  type: 'property' | 'scene' | 'media' | 'feature';
  title: string;
  subtitle: string;
  tag: string;
  score: number;
  data: any;
}

// Curated stock library of high-resolution real estate photography for instant insertion
export const CURATED_STOCK_MEDIA: PropertyImage[] = [
  {
    id: 'stock-pool-1',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1280&q=80',
    label: 'Heated Infinity Pool & Sun Deck',
    caption: 'Temperature controlled swimming pool with mosaic tile and deck',
  },
  {
    id: 'stock-kitchen-1',
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1280&q=80',
    label: 'German Modular Kitchen with Quartz Island',
    caption: 'Modern luxury kitchen with integrated high-efficiency appliances',
  },
  {
    id: 'stock-living-1',
    url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1280&q=80',
    label: 'Sunlit Living Room & Italian Marble',
    caption: 'Double volume open plan living lounge with panoramic glazing',
  },
  {
    id: 'stock-balcony-1',
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1280&q=80',
    label: 'Skyline Terrace Balcony with Sunset View',
    caption: 'Wrap-around balcony overlooking the city skyline',
  },
  {
    id: 'stock-bed-1',
    url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1280&q=80',
    label: 'Master Suite Retreat with Spa Bath',
    caption: 'Acoustically insulated master bedroom with ensuite walk-in closet',
  },
  {
    id: 'stock-facade-1',
    url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1280&q=80',
    label: 'Contemporary High-Rise Tower Facade',
    caption: 'Architectural marvel with glass facade and landscaped podium',
  },
  {
    id: 'stock-garden-1',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1280&q=80',
    label: 'Zen Courtyard & Private Lawn',
    caption: 'Manicured private garden with wooden pergola and water feature',
  },
  {
    id: 'stock-dining-1',
    url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1280&q=80',
    label: 'Designer Dining Room & Wet Bar',
    caption: 'Sculptural chandelier and 8-seater bespoke marble dining table',
  },
];

/**
 * Fast sub-millisecond search across property catalog, current scenes, and stock media library.
 */
export function searchContent(
  query: string,
  currentProperty: PropertyDetails,
  currentScenes: Scene[]
): SearchResultItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: SearchResultItem[] = [];
  const words = q.split(/\s+/).filter(Boolean);

  const calculateRelevance = (text: string): number => {
    const lower = text.toLowerCase();
    if (lower === q) return 100;
    if (lower.startsWith(q)) return 75;
    if (lower.includes(q)) return 50;

    let matchCount = 0;
    for (const w of words) {
      if (lower.includes(w)) matchCount++;
    }
    return matchCount > 0 ? (matchCount / words.length) * 40 : 0;
  };

  // 1. Search Properties Catalog
  Object.entries(SAMPLE_PROPERTIES).forEach(([key, prop]) => {
    const combined = `${prop.propertyName} ${prop.location} ${prop.propertyType} ${prop.price} ${prop.keyFeatures.join(' ')}`;
    const score = calculateRelevance(combined);
    if (score > 0) {
      results.push({
        id: `prop-${key}`,
        type: 'property',
        title: prop.propertyName,
        subtitle: `${prop.propertyType} • ${prop.location} • ${prop.price}`,
        tag: 'Property Listing',
        score: score + 15, // slight boost for full properties
        data: prop,
      });
    }
  });

  // 2. Search Active Scenes in Current Video
  currentScenes.forEach((scene, idx) => {
    const combined = `${scene.title} ${scene.subtitle} ${scene.badgeText || ''} ${scene.caption} ${scene.voiceoverScript}`;
    const score = calculateRelevance(combined);
    if (score > 0) {
      results.push({
        id: `scene-${scene.id || idx}`,
        type: 'scene',
        title: scene.title,
        subtitle: `Scene #${idx + 1}: ${scene.caption || scene.voiceoverScript}`,
        tag: 'Storyboard Scene',
        score: score + 10,
        data: { sceneIndex: idx, scene },
      });
    }
  });

  // 3. Search Key Features of current listing
  (currentProperty.keyFeatures || []).forEach((feat, idx) => {
    const score = calculateRelevance(feat);
    if (score > 0) {
      results.push({
        id: `feat-${idx}`,
        type: 'feature',
        title: feat,
        subtitle: `Feature highlight in ${currentProperty.propertyName}`,
        tag: 'Listing Highlight',
        score: score + 5,
        data: { feature: feat, index: idx },
      });
    }
  });

  // 4. Search Curated Stock Architectural Media Library
  CURATED_STOCK_MEDIA.forEach((media) => {
    const combined = `${media.label} ${media.caption || ''}`;
    const score = calculateRelevance(combined);
    if (score > 0) {
      results.push({
        id: `media-${media.id}`,
        type: 'media',
        title: media.label,
        subtitle: media.caption || 'High-res architectural photo',
        tag: 'Media Library',
        score,
        data: media,
      });
    }
  });

  // Sort descending by relevance score
  return results.sort((a, b) => b.score - a.score).slice(0, 10);
}

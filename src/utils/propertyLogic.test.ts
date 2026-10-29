import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateProperty,
  formatPrice,
  calculateSceneTimings,
  getAspectDimensions,
  generateFallbackScript,
} from './propertyLogic';
import { PropertyDetails, Scene } from '../types/property';

test('validateProperty detects missing mandatory fields', () => {
  const empty: Partial<PropertyDetails> = {};
  const result = validateProperty(empty);

  assert.equal(result.isValid, false);
  assert.ok(result.errors.some((e) => e.field === 'propertyName'));
  assert.ok(result.errors.some((e) => e.field === 'location'));
  assert.ok(result.errors.some((e) => e.field === 'price'));
  assert.ok(result.errors.some((e) => e.field === 'propertyType'));
  assert.ok(result.errors.some((e) => e.field === 'images'));
});

test('validateProperty issues warnings when images are under recommended count', () => {
  const minimal: Partial<PropertyDetails> = {
    propertyName: 'Palm View Residence',
    propertyType: '2-BHK Apartment',
    location: 'Miami, FL',
    price: '$650,000',
    contactText: 'Call 555-0192',
    images: [{ id: '1', url: 'https://example.com/1.jpg', label: 'Living' }],
    keyFeatures: ['Balcony'],
  };
  const result = validateProperty(minimal);

  assert.equal(result.isValid, true);
  assert.equal(result.errors.length, 0);
  assert.ok(result.warnings.some((w) => w.includes('Recommended 4–8 property images')));
});

test('formatPrice correctly handles numbers and currencies in INR', () => {
  assert.equal(formatPrice(18500000), '₹1.85 Cr');
  assert.equal(formatPrice(9500000), '₹95 Lakh');
  assert.equal(formatPrice('₹1.85 Cr'), '₹1.85 Cr');
  assert.equal(formatPrice('Rs. 2.45 Cr'), '₹2.45 Cr');
  assert.equal(formatPrice('$685,000'), '₹685,000');
});

test('getAspectDimensions returns proper widths and heights', () => {
  const dims169 = getAspectDimensions('16:9');
  assert.equal(dims169.width, 1280);
  assert.equal(dims169.height, 720);

  const dims916 = getAspectDimensions('9:16');
  assert.equal(dims916.width, 720);
  assert.equal(dims916.height, 1280);

  const dims11 = getAspectDimensions('1:1');
  assert.equal(dims11.width, 1080);
  assert.equal(dims11.height, 1080);
});

test('calculateSceneTimings normalizes durations proportionally to target duration', () => {
  const mockScenes: Scene[] = [
    {
      id: 's1',
      type: 'intro',
      title: 'Intro',
      subtitle: 'Sub',
      caption: 'Cap',
      voiceoverScript: 'Voice',
      imageIndex: 0,
      durationSec: 5,
      motion: { startScale: 1, endScale: 1.1, startX: 0, endX: 0, startY: 0, endY: 0 },
    },
    {
      id: 's2',
      type: 'feature',
      title: 'Feature',
      subtitle: 'Sub',
      caption: 'Cap',
      voiceoverScript: 'Voice',
      imageIndex: 1,
      durationSec: 5,
      motion: { startScale: 1, endScale: 1.1, startX: 0, endX: 0, startY: 0, endY: 0 },
    },
  ];

  const timings = calculateSceneTimings(mockScenes, 20);
  assert.equal(timings.length, 2);
  assert.equal(timings[0].startTime, 0);
  assert.equal(timings[0].duration, 10);
  assert.equal(timings[1].startTime, 10);
  assert.equal(timings[1].endTime, 20);
});

test('generateFallbackScript creates coherent scene breakdown using input facts', () => {
  const details: PropertyDetails = {
    propertyName: 'Sunset Heights 2-BHK',
    propertyType: '2-BHK Modern Apartment',
    location: 'Austin, TX',
    price: '$450,000',
    keyFeatures: ['Designer Modular Kitchen', 'Skyline Balcony View', 'Hardwood Flooring'],
    contactText: 'Call Davinder Singh at 555-0199',
    images: [
      { id: 'img-1', url: 'https://example.com/facade.jpg', label: 'Exterior Facade' },
      { id: 'img-2', url: 'https://example.com/living.jpg', label: 'Living Room' },
      { id: 'img-3', url: 'https://example.com/kitchen.jpg', label: 'Modular Kitchen' },
      { id: 'img-4', url: 'https://example.com/balcony.jpg', label: 'Balcony' },
    ],
  };

  const script = generateFallbackScript(details);
  assert.ok(script.scenes.length >= 3);
  assert.equal(script.scenes[0].type, 'intro');
  assert.equal(script.scenes[script.scenes.length - 1].type, 'outro');
  assert.ok(script.scenes[0].title.includes('Sunset Heights 2-BHK'));
  assert.ok(script.fullVoiceover.includes('Austin, TX'));
  assert.ok(script.fullVoiceover.includes('Sunset Heights 2-BHK'));
});

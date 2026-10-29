import test from 'node:test';
import assert from 'node:assert/strict';
import { searchContent } from './searchLogic';
import { SAMPLE_PROPERTIES } from '../data/sampleProperties';

test('searchContent returns empty array for blank or whitespace query', () => {
  const current = SAMPLE_PROPERTIES['sunset-loft'];
  const res = searchContent('', current, []);
  assert.equal(res.length, 0);

  const resSpaces = searchContent('    ', current, []);
  assert.equal(resSpaces.length, 0);
});

test('searchContent finds properties by city or locality in INR', () => {
  const current = SAMPLE_PROPERTIES['sunset-loft'];
  const resultsGurugram = searchContent('Gurugram', current, []);
  assert.ok(resultsGurugram.length > 0);
  assert.ok(resultsGurugram.some((r) => r.type === 'property' && r.subtitle.includes('Gurugram')));

  const resultsGoa = searchContent('Goa', current, []);
  assert.ok(resultsGoa.length > 0);
  assert.ok(resultsGoa.some((r) => r.title.includes('Villa Bellisima')));
  assert.ok(resultsGoa[0].subtitle.includes('₹8.45 Cr'));
});

test('searchContent finds media library photos by keyword', () => {
  const current = SAMPLE_PROPERTIES['sunset-loft'];
  const resultsKitchen = searchContent('kitchen', current, []);
  assert.ok(resultsKitchen.length > 0);
  assert.ok(resultsKitchen.some((r) => r.type === 'media' && r.title.toLowerCase().includes('kitchen')));

  const resultsPool = searchContent('pool', current, []);
  assert.ok(resultsPool.length > 0);
  assert.ok(resultsPool.some((r) => r.type === 'media' && r.title.toLowerCase().includes('pool')));
});

test('searchContent finds active storyboard scenes', () => {
  const current = SAMPLE_PROPERTIES['sunset-loft'];
  const mockScenes = [
    {
      id: 's1',
      type: 'intro' as const,
      title: 'Grand Entrance',
      subtitle: 'Sector 42',
      caption: 'Welcome to luxury',
      voiceoverScript: 'Step into perfection',
      imageIndex: 0,
      durationSec: 5,
      motion: { startScale: 1, endScale: 1.1, startX: 0, endX: 0, startY: 0, endY: 0 },
    },
  ];

  const results = searchContent('Entrance', current, mockScenes);
  assert.ok(results.length > 0);
  assert.ok(results.some((r) => r.type === 'scene' && r.title === 'Grand Entrance'));
});

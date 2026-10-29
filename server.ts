import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { PropertyDetails } from './src/types/property';
import { buildPromptForProperty, generateFallbackScript } from './src/utils/propertyLogic';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK on server side
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * POST /api/generate-script
 * Uses Gemini API (gemini-3.8-flash) to write a voice-over script and scene breakdown
 * strictly using the supplied property facts.
 */
app.post('/api/generate-script', async (req: Request, res: Response): Promise<void> => {
  const details: PropertyDetails = req.body;

  if (!details || !details.propertyName) {
    res.status(400).json({ error: 'Property details are required' });
    return;
  }

  // If Gemini API is available, generate script with Gemini Flash
  if (ai) {
    try {
      const prompt = buildPromptForProperty(details);
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a professional real estate video copywriter. You must strictly only use the facts provided in the prompt. Do not hallucinate or invent features. Output pure JSON only without markdown fences.',
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const responseText = response.text || '';
      try {
        const parsed = JSON.parse(responseText);

        // Sanitize & map to ensure complete scene data
        const fallback = generateFallbackScript(details);
        const headline = parsed.headline || fallback.headline;
        const fullVoiceover = parsed.fullVoiceover || fallback.fullVoiceover;

        const scenes = Array.isArray(parsed.scenes) && parsed.scenes.length >= 3
          ? parsed.scenes.map((s: any, idx: number) => {
              const fallbackScene = fallback.scenes[idx] || fallback.scenes[fallback.scenes.length - 1];
              return {
                id: s.id || `scene-${idx + 1}`,
                type: s.type || fallbackScene.type,
                title: s.title || fallbackScene.title,
                subtitle: s.subtitle || fallbackScene.subtitle,
                badgeText: s.badgeText || fallbackScene.badgeText,
                caption: s.caption || fallbackScene.caption,
                voiceoverScript: s.voiceoverScript || fallbackScene.voiceoverScript,
                imageIndex: typeof s.imageIndex === 'number' && s.imageIndex < details.images.length
                  ? s.imageIndex
                  : fallbackScene.imageIndex,
                durationSec: typeof s.durationSec === 'number' ? s.durationSec : 5,
                motion: fallbackScene.motion,
              };
            })
          : fallback.scenes;

        res.json({
          source: 'gemini-3.8-flash',
          headline,
          fullVoiceover,
          scenes,
        });
        return;
      } catch (parseErr) {
        console.warn('JSON parse fallback triggered:', parseErr);
        // Fall back to template logic
        const fallback = generateFallbackScript(details);
        res.json({
          source: 'deterministic-template',
          ...fallback,
        });
        return;
      }
    } catch (apiErr) {
      console.warn('Gemini API call failed, falling back to deterministic template:', apiErr);
      const fallback = generateFallbackScript(details);
      res.json({
        source: 'deterministic-template',
        ...fallback,
      });
      return;
    }
  }

  // Fallback when no API key configured
  const fallback = generateFallbackScript(details);
  res.json({
    source: 'deterministic-template',
    ...fallback,
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Mount Vite dev server middleware in development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const path = await import('path');
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Realty Assistant Server running on http://localhost:${PORT}`);
  });
}

startServer();

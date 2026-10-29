import { AspectRatio, Scene, VideoProject } from '../types/property';
import { calculateSceneTimings, getAspectDimensions } from './propertyLogic';
import { audioSynthesizer } from './audioSynthesizer';

// Image cache to avoid re-fetching images on every animation frame
const imageCache: Map<string, HTMLImageElement> = new Map();

export async function preloadImage(url: string): Promise<HTMLImageElement> {
  if (imageCache.has(url)) {
    const cached = imageCache.get(url)!;
    if (cached.complete && cached.naturalWidth > 0) return cached;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(url, img);
      resolve(img);
    };
    img.onerror = () => {
      // Fallback 1x1 transparent or gradient canvas data url if image failed to load
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = 1280;
      fallbackCanvas.height = 720;
      const fctx = fallbackCanvas.getContext('2d');
      if (fctx) {
        const grad = fctx.createLinearGradient(0, 0, 1280, 720);
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(1, '#0f172a');
        fctx.fillStyle = grad;
        fctx.fillRect(0, 0, 1280, 720);
      }
      img.src = fallbackCanvas.toDataURL();
      imageCache.set(url, img);
      resolve(img);
    };
    img.src = url;
  });
}

export async function preloadAllImages(urls: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(urls.map((u) => preloadImage(u)));
}

/**
 * Draws a single video frame onto the target 2D canvas context.
 */
export function renderFrame(
  ctx: CanvasRenderingContext2D,
  project: VideoProject,
  currentTimeSec: number,
  preloadedImages: HTMLImageElement[]
) {
  const { width, height } = getAspectDimensions(project.aspectRatio);
  const totalDuration = project.targetDurationSec;
  const clampedTime = Math.min(Math.max(0, currentTimeSec), totalDuration);
  const timings = calculateSceneTimings(project.scenes, totalDuration);

  // Find active scene
  let activeSceneIndex = 0;
  let activeTiming = timings[0];

  for (let i = 0; i < timings.length; i++) {
    if (clampedTime >= timings[i].startTime && clampedTime <= timings[i].endTime) {
      activeSceneIndex = i;
      activeTiming = timings[i];
      break;
    }
  }

  if (!activeTiming && timings.length > 0) {
    activeSceneIndex = timings.length - 1;
    activeTiming = timings[timings.length - 1];
  }

  const activeScene = project.scenes[activeSceneIndex] || project.scenes[0];
  const sceneProgress = activeTiming.duration > 0
    ? Math.min(1, Math.max(0, (clampedTime - activeTiming.startTime) / activeTiming.duration))
    : 0;

  // Background fallback
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, width, height);

  // 1. Draw Property Image with Ken Burns Camera Motion
  const targetImage = preloadedImages[activeScene.imageIndex] || preloadedImages[0];
  if (targetImage && targetImage.naturalWidth > 0) {
    ctx.save();

    const m = activeScene.motion || {
      startScale: 1.0,
      endScale: 1.1,
      startX: 0,
      endX: -10,
      startY: 0,
      endY: -5,
    };

    // Smooth easing
    const ease = 0.5 - Math.cos(sceneProgress * Math.PI) / 2;
    const currentScale = m.startScale + (m.endScale - m.startScale) * ease;
    const currentX = (m.startX + (m.endX - m.startX) * ease) * (width / 1000);
    const currentY = (m.startY + (m.endY - m.startY) * ease) * (height / 1000);

    ctx.translate(width / 2 + currentX, height / 2 + currentY);
    // Base cover scale plus 8% safety margin so pans never reveal black borders
    const baseCoverScale = 1.08;
    ctx.scale(currentScale * baseCoverScale, currentScale * baseCoverScale);

    // Compute aspect fill
    const imgRatio = targetImage.naturalWidth / targetImage.naturalHeight;
    const canvasRatio = width / height;
    let drawW = width;
    let drawH = height;

    if (imgRatio > canvasRatio) {
      drawH = height;
      drawW = height * imgRatio;
    } else {
      drawW = width;
      drawH = width / imgRatio;
    }

    ctx.drawImage(targetImage, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }

  // 2. Cinematic Vignette & Gradient Overlays
  // Top gradient for header info
  const topGrad = ctx.createLinearGradient(0, 0, 0, height * 0.38);
  topGrad.addColorStop(0, 'rgba(10, 15, 29, 0.90)');
  topGrad.addColorStop(0.55, 'rgba(10, 15, 29, 0.50)');
  topGrad.addColorStop(1, 'rgba(10, 15, 29, 0)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, width, height * 0.38);

  // Bottom gradient for captions and lower-third
  const bottomGrad = ctx.createLinearGradient(0, height * 0.50, 0, height);
  bottomGrad.addColorStop(0, 'rgba(10, 15, 29, 0)');
  bottomGrad.addColorStop(0.35, 'rgba(10, 15, 29, 0.70)');
  bottomGrad.addColorStop(1, 'rgba(10, 15, 29, 0.96)');
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(0, height * 0.50, width, height * 0.50);

  // 3. Brand & Header Bar
  const isVertical = project.aspectRatio === '9:16';
  const paddingX = isVertical ? width * 0.08 : width * 0.05;
  const paddingY = isVertical ? height * 0.06 : height * 0.06;

  // Davinder Singh Brand Logo Pill (Black, White, Red, Sharp)
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.90)';
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 2;
  const badgeH = 34;
  const badgeW = 200;
  roundRect(ctx, paddingX, paddingY, badgeW, badgeH, 0);
  ctx.fill();
  ctx.stroke();

  // Red accent indicator block
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(paddingX + 8, paddingY + 7, 6, 20);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 13px system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('DAVINDER SINGH', paddingX + 22, paddingY + badgeH / 2);
  ctx.restore();

  // Price Tag Badge (Top Right)
  if (project.details.price) {
    ctx.save();
    const priceText = project.details.price;
    ctx.font = '800 16px sans-serif';
    const pWidth = ctx.measureText(priceText).width + 32;
    const pX = width - paddingX - pWidth;

    // Red accent tag
    ctx.fillStyle = '#dc2626';
    roundRect(ctx, pX, paddingY, pWidth, badgeH, 0);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.fillText(priceText, pX + 16, paddingY + badgeH / 2);
    ctx.restore();
  }

  // 4. Render Scene-Specific Overlays
  if (activeScene.type === 'intro') {
    renderIntroOverlay(ctx, project, activeScene, width, height, isVertical, paddingX, paddingY, sceneProgress);
  } else if (activeScene.type === 'feature') {
    renderFeatureOverlay(ctx, project, activeScene, width, height, isVertical, paddingX, paddingY, sceneProgress);
  } else if (activeScene.type === 'outro') {
    renderOutroOverlay(ctx, project, activeScene, width, height, isVertical, paddingX, paddingY, sceneProgress);
  }

  // 5. Timeline Progress Bar at bottom
  const progressRatio = clampedTime / totalDuration;
  const barH = 5;
  const barY = height - barH;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(0, barY, width, barH);

  ctx.fillStyle = '#dc2626'; // Red accent
  ctx.fillRect(0, barY, width * progressRatio, barH);
}

function renderIntroOverlay(
  ctx: CanvasRenderingContext2D,
  project: VideoProject,
  scene: Scene,
  width: number,
  height: number,
  isVertical: boolean,
  padX: number,
  _padY: number,
  _progress: number
) {
  ctx.save();
  ctx.globalAlpha = 1.0;

  const contentY = isVertical ? height * 0.62 : height * 0.65;

  // Property Type Chip
  ctx.fillStyle = '#dc2626';
  roundRect(ctx, padX, contentY - 44, 230, 26, 0);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 12px system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(project.details.propertyType.toUpperCase(), padX + 12, contentY - 31);

  // Main Property Name
  ctx.fillStyle = '#ffffff';
  ctx.font = isVertical ? '800 32px system-ui, sans-serif' : '800 40px system-ui, sans-serif';
  ctx.textBaseline = 'top';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
  ctx.shadowBlur = 14;
  ctx.fillText(scene.title, padX, contentY);

  // Location Subtitle with Pin
  ctx.font = isVertical ? '600 16px system-ui, sans-serif' : '600 20px system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`📍 ${scene.subtitle}`, padX, contentY + (isVertical ? 46 : 54));

  // Voiceover Caption Lower Third Box
  if (scene.caption) {
    const captionY = contentY + (isVertical ? 84 : 94);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.90)';
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.5;
    roundRect(ctx, padX, captionY, width - padX * 2, 44, 0);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = isVertical ? '500 13px system-ui, sans-serif' : '500 15px system-ui, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(`“${scene.caption}”`, padX + 16, captionY + 22);
  }

  ctx.restore();
}

function renderFeatureOverlay(
  ctx: CanvasRenderingContext2D,
  _project: VideoProject,
  scene: Scene,
  width: number,
  height: number,
  isVertical: boolean,
  padX: number,
  _padY: number,
  _progress: number
) {
  ctx.save();
  ctx.globalAlpha = 1.0;

  const contentY = isVertical ? height * 0.65 : height * 0.68;

  // Highlight Badge
  if (scene.badgeText) {
    ctx.fillStyle = '#dc2626';
    roundRect(ctx, padX, contentY - 42, 130, 24, 0);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 11px system-ui, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(scene.badgeText.toUpperCase(), padX + 12, contentY - 30);
  }

  // Feature Title
  ctx.fillStyle = '#ffffff';
  ctx.font = isVertical ? '800 30px system-ui, sans-serif' : '800 38px system-ui, sans-serif';
  ctx.textBaseline = 'top';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
  ctx.shadowBlur = 14;
  ctx.fillText(scene.title, padX, contentY);

  // Subtitle / Spec
  ctx.font = isVertical ? '600 16px system-ui, sans-serif' : '600 19px system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(scene.subtitle, padX, contentY + (isVertical ? 42 : 50));

  // Voiceover Caption Box
  if (scene.caption) {
    const captionY = contentY + (isVertical ? 80 : 90);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.90)';
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.5;
    roundRect(ctx, padX, captionY, width - padX * 2, 44, 0);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = isVertical ? '500 13px system-ui, sans-serif' : '500 15px system-ui, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(`“${scene.caption}”`, padX + 16, captionY + 22);
  }

  ctx.restore();
}

function renderOutroOverlay(
  ctx: CanvasRenderingContext2D,
  project: VideoProject,
  scene: Scene,
  width: number,
  height: number,
  isVertical: boolean,
  padX: number,
  _padY: number,
  _progress: number
) {
  ctx.save();
  ctx.globalAlpha = 1.0;

  // Centered Outro Card
  const cardW = isVertical ? width * 0.90 : Math.min(720, width * 0.80);
  const cardH = isVertical ? 340 : 270;
  const cardX = (width - cardW) / 2;
  const cardY = (height - cardH) / 2;

  // Sharp Luxury Card Box
  ctx.fillStyle = 'rgba(0, 0, 0, 0.96)';
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 2;
  roundRect(ctx, cardX, cardY, cardW, cardH, 0);
  ctx.fill();
  ctx.stroke();

  // Card Content
  ctx.textAlign = 'center';

  // Badge
  ctx.fillStyle = '#dc2626';
  ctx.font = '900 13px system-ui, sans-serif';
  ctx.fillText('EXCLUSIVE INQUIRY • DAVINDER SINGH', width / 2, cardY + 40);

  // Main Callout
  ctx.fillStyle = '#ffffff';
  ctx.font = isVertical ? '800 26px system-ui, sans-serif' : '800 32px system-ui, sans-serif';
  ctx.fillText(scene.title, width / 2, cardY + (isVertical ? 82 : 80));

  // Property Details summary
  ctx.fillStyle = '#e4e4e7';
  ctx.font = '600 15px system-ui, sans-serif';
  ctx.fillText(`${project.details.propertyName} • ${project.details.location}`, width / 2, cardY + (isVertical ? 122 : 116));

  // CTA Button
  const btnW = cardW * 0.75;
  const btnH = 48;
  const btnX = (width - btnW) / 2;
  const btnY = cardY + (isVertical ? 158 : 148);

  ctx.fillStyle = '#dc2626';
  roundRect(ctx, btnX, btnY, btnW, btnH, 0);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 16px system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(project.details.price ? `Inquire Now • ${project.details.price}` : 'Book Private Tour', width / 2, btnY + btnH / 2);

  // Contact line
  ctx.fillStyle = '#ffffff';
  ctx.font = '500 13px system-ui, sans-serif';
  ctx.fillText(project.details.contactText, width / 2, cardY + (isVertical ? 240 : 225));

  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Records the video project in real-time or fast-frame export into a downloadable video Blob.
 */
export async function exportVideo(
  project: VideoProject,
  onProgress?: (percent: number) => void
): Promise<{ blob: Blob; url: string; filename: string }> {
  const { width, height } = getAspectDimensions(project.aspectRatio);

  // Hidden offscreen canvas for rendering
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize canvas context');

  // Preload all project images
  const imageUrls = project.details.images.map((img) => img.url);
  const preloaded = await preloadAllImages(imageUrls);

  // Capture canvas video stream
  const canvasStream = canvas.captureStream(30);

  // Audio track from AudioSynthesizer
  const audioTrack = audioSynthesizer.getAudioStream();
  const streamTracks = [...canvasStream.getVideoTracks()];
  if (audioTrack && project.enableMusic && project.musicTheme !== 'none') {
    streamTracks.push(audioTrack);
  }

  const combinedStream = new MediaStream(streamTracks);

  // Determine supported mime type
  const mimeType = MediaRecorder.isTypeSupported('video/mp4')
    ? 'video/mp4'
    : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm';

  const recorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: 4500000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  const totalDuration = project.targetDurationSec;
  const fps = 30;
  const totalFrames = Math.floor(totalDuration * fps);
  const frameIntervalMs = 1000 / fps;

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      audioSynthesizer.stopMusic();
      const finalBlob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(finalBlob);
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const cleanName = project.details.propertyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const filename = `${cleanName || 'davinder-singh-property'}-video.${ext}`;
      resolve({ blob: finalBlob, url, filename });
    };

    recorder.onerror = (err) => {
      audioSynthesizer.stopMusic();
      reject(err);
    };

    recorder.start(100);
    if (project.enableMusic && project.musicTheme !== 'none') {
      audioSynthesizer.startMusic();
    }

    let frame = 0;
    const interval = setInterval(() => {
      if (frame >= totalFrames) {
        clearInterval(interval);
        recorder.stop();
        return;
      }

      const currentTimeSec = (frame / totalFrames) * totalDuration;
      renderFrame(ctx, project, currentTimeSec, preloaded);

      frame++;
      const pct = Math.min(100, Math.round((frame / totalFrames) * 100));
      onProgress?.(pct);
    }, frameIntervalMs);
  });
}

// Static text that the cursor blows into vapor; letters then resettle.
// The real text stays in the DOM (transparent) for layout, wrapping, selection
// and screen readers; a canvas overlay redraws it as particles. Inspired by
// React Bits Pro "Vapor Type", minus its condense/dissolve word cycle.
import { useEffect, useRef } from 'react';
import './VaporText.css';

const MAX_DPR = 2;

const VaporText = ({
  text,
  as: Tag = 'span',
  className = '',
  vaporColor = '#79d9ff', // colour particles fade to while airborne
  breath = 1, // pointer strength
  breathRadius = 1.2, // pointer reach, in multiples of the font size
  recovery = 1.2, // seconds for letters to resettle
  rise = 1, // upward drift of vapor (negative sinks)
  turbulence = 1, // how much vapor curls
  settleDamping = 0.4, // per-frame velocity kept while resettling (lower = less bounce)
  outlineColor = null, // optional outline drawn as particles (replaces CSS text-shadow/stroke)
  outlineWidth = 0 // outline thickness in px
}) => {
  const rootRef = useRef(null);
  const textRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const textEl = textRef.current;
    const canvas = canvasRef.current;
    if (!root || !textEl || !canvas) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Particle state (struct of arrays)
    let count = 0;
    let hx, hy, x, y, vx, vy, heat, isOutline;
    let size = 1;
    let fontSize = 16;
    let bleed = 0;
    let textColor = '#fff';
    let cssW = 0;
    let cssH = 0;
    // Crisp glyphs at device resolution, shown wherever particles are at rest
    const crisp = document.createElement('canvas');
    const cctx = crisp.getContext('2d');

    const pointer = { x: 0, y: 0, vx: 0, vy: 0, t: 0, lastMove: -Infinity };
    let raf = 0;
    let lastFrame = 0;
    let buildRaf = 0;

    const build = () => {
      const rootRect = root.getBoundingClientRect();
      const node = textEl.firstChild;
      if (!rootRect.width || !rootRect.height || !node) return;

      const cs = getComputedStyle(textEl);
      fontSize = parseFloat(cs.fontSize) || 16;
      textColor = getComputedStyle(root).color;
      bleed = Math.round(Math.min(fontSize * 2.5, 160));
      cssW = Math.ceil(rootRect.width + bleed * 2);
      cssH = Math.ceil(rootRect.height + bleed * 2);

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      canvas.style.left = `${-bleed}px`;
      canvas.style.top = `${-bleed}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Draw each word exactly where the browser laid it out, then sample it
      const off = document.createElement('canvas');
      off.width = cssW;
      off.height = cssH;
      const o = off.getContext('2d', { willReadFrequently: true });
      o.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      o.fillStyle = '#fff';
      o.textBaseline = 'alphabetic';
      const ascent = o.measureText('Mg').fontBoundingBoxAscent ?? fontSize * 0.8;

      // Outline goes on a second layer so particles can tell fill from outline
      const outline = outlineColor && outlineWidth > 0;
      let ol = null;
      let olCanvas = null;
      if (outline) {
        olCanvas = document.createElement('canvas');
        olCanvas.width = cssW;
        olCanvas.height = cssH;
        ol = olCanvas.getContext('2d', { willReadFrequently: true });
        ol.font = o.font;
        ol.strokeStyle = '#fff';
        ol.lineWidth = outlineWidth * 2;
        ol.lineJoin = 'round';
        ol.textBaseline = 'alphabetic';
      }

      crisp.width = canvas.width;
      crisp.height = canvas.height;
      cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cctx.clearRect(0, 0, cssW, cssH);
      cctx.font = o.font;
      cctx.textBaseline = 'alphabetic';
      cctx.lineJoin = 'round';
      cctx.lineWidth = outlineWidth * 2;
      cctx.strokeStyle = outlineColor;
      cctx.fillStyle = textColor;

      const range = document.createRange();
      const str = node.textContent;
      const wordRe = /\S+/g;
      let m;
      while ((m = wordRe.exec(str))) {
        range.setStart(node, m.index);
        range.setEnd(node, m.index + m[0].length);
        const r = range.getClientRects()[0];
        if (!r) continue;
        const wx = r.left - rootRect.left + bleed;
        const wy = r.top - rootRect.top + bleed + ascent;
        o.fillText(m[0], wx, wy);
        ol?.strokeText(m[0], wx, wy);
        if (outline) cctx.strokeText(m[0], wx, wy);
        cctx.fillText(m[0], wx, wy);
      }

      const step = Math.min(2, Math.max(1, fontSize / 20));
      size = step * 1.05;
      const data = o.getImageData(0, 0, off.width, off.height).data;
      const olData = ol?.getImageData(0, 0, cssW, cssH).data;
      const px = [];
      const kinds = [];
      for (let sy = 0; sy < cssH; sy += step) {
        for (let sx = 0; sx < cssW; sx += step) {
          const idx = ((sy | 0) * off.width + (sx | 0)) * 4 + 3;
          if (data[idx] > 110) {
            px.push(sx, sy);
            kinds.push(0);
          } else if (olData && olData[idx] > 110) {
            px.push(sx, sy);
            kinds.push(1);
          }
        }
      }

      count = px.length / 2;
      isOutline = Uint8Array.from(kinds);
      hx = new Float32Array(count);
      hy = new Float32Array(count);
      x = new Float32Array(count);
      y = new Float32Array(count);
      vx = new Float32Array(count);
      vy = new Float32Array(count);
      heat = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        hx[i] = x[i] = px[i * 2];
        hy[i] = y[i] = px[i * 2 + 1];
      }

      draw();
      root.classList.add('vapor-text--ready');
    };

    const scheduleBuild = () => {
      cancelAnimationFrame(buildRaf);
      buildRaf = requestAnimationFrame(build);
    };

    const draw = () => {
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.globalAlpha = 1;
      ctx.drawImage(crisp, 0, 0, cssW, cssH);

      // Punch holes in the crisp text where particles have left home
      let displaced = 0;
      ctx.globalCompositeOperation = 'destination-out';
      for (let i = 0; i < count; i++) {
        if (heat[i] > 0 || x[i] !== hx[i] || y[i] !== hy[i]) {
          ctx.fillRect(hx[i], hy[i], size, size);
          displaced++;
        }
      }
      ctx.globalCompositeOperation = 'source-over';
      if (!displaced) return;

      const away = i => heat[i] > 0 || x[i] !== hx[i] || y[i] !== hy[i];
      if (outlineColor) {
        ctx.fillStyle = outlineColor;
        for (let i = 0; i < count; i++) {
          if (isOutline[i] && heat[i] < 0.04 && away(i)) ctx.fillRect(x[i], y[i], size, size);
        }
      }
      ctx.fillStyle = textColor;
      for (let i = 0; i < count; i++) {
        if (!isOutline[i] && heat[i] < 0.04 && away(i)) ctx.fillRect(x[i], y[i], size, size);
      }
      ctx.fillStyle = vaporColor;
      for (let i = 0; i < count; i++) {
        const h = heat[i];
        if (h >= 0.04) {
          ctx.globalAlpha = 1 - h * 0.85;
          const s = size * (1 + h * 0.6);
          ctx.fillRect(x[i], y[i], s, s);
        }
      }
      ctx.globalAlpha = 1;
    };

    const tick = now => {
      const dt = Math.min((now - lastFrame) / 1000, 1 / 30);
      lastFrame = now;
      const t = now / 1000;

      const moving = now - pointer.lastMove < 60;
      const speed = Math.hypot(pointer.vx, pointer.vy);
      const R = Math.max(28, breathRadius * fontSize);
      const R2 = R * R;
      const blow = moving ? breath * Math.min(0.25 + speed / 900, 3) : 0;
      // Light damping lets hot vapor drift; heavier damping as it cools stops
      // letters overshooting and wobbling when they snap back
      const dampHot = Math.pow(0.9, dt * 60);
      const dampCool = Math.pow(settleDamping, dt * 60);
      const cool = dt / recovery;
      let active = 0;

      for (let i = 0; i < count; i++) {
        if (blow) {
          const dx = x[i] - pointer.x;
          const dy = y[i] - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R2) {
            const d = Math.sqrt(d2) || 1;
            const f = (1 - d / R) * blow;
            vx[i] += (dx / d) * f * 6 + pointer.vx * f * 0.004;
            vy[i] += (dy / d) * f * 6 + pointer.vy * f * 0.004 - rise * f * 2;
            heat[i] = Math.min(1, heat[i] + f * 0.5);
          }
        }

        const h = heat[i];
        if (h > 0) {
          // Curling air current + buoyancy while airborne
          const a = Math.sin(x[i] * 0.021 + t * 1.7) * 2.2 + Math.cos(y[i] * 0.017 - t * 1.3) * 2.2;
          vx[i] += Math.cos(a) * turbulence * h * 40 * dt;
          vy[i] += Math.sin(a) * turbulence * h * 40 * dt - rise * h * 30 * dt;
          heat[i] = Math.max(0, h - cool);
        }

        // Spring home, weaker while hot so vapor drifts before resettling
        const k = 90 * (1 - heat[i]) * (1 - heat[i]) + 2;
        const damp = dampCool + (dampHot - dampCool) * heat[i] * heat[i];
        vx[i] = (vx[i] + (hx[i] - x[i]) * k * dt) * damp;
        vy[i] = (vy[i] + (hy[i] - y[i]) * k * dt) * damp;
        x[i] += vx[i] * dt * 60 * 0.5;
        y[i] += vy[i] * dt * 60 * 0.5;

        if (heat[i] === 0 && Math.abs(x[i] - hx[i]) < 0.05 && Math.abs(y[i] - hy[i]) < 0.05 &&
            Math.abs(vx[i]) < 0.02 && Math.abs(vy[i]) < 0.02) {
          x[i] = hx[i];
          y[i] = hy[i];
          vx[i] = vy[i] = 0;
        } else {
          active++;
        }
      }

      draw();
      // Sleep when everything has settled and the pointer is still
      raf = active || moving ? requestAnimationFrame(tick) : 0;
    };

    const wake = () => {
      if (raf) return;
      lastFrame = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const onPointerMove = e => {
      if (e.pointerType === 'touch' || !count) return; // don't react to scroll gestures
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      if (px < 0 || py < 0 || px > rect.width || py > rect.height) return;
      const now = performance.now();
      const dt = Math.max(now - pointer.t, 8) / 1000;
      const fresh = now - pointer.lastMove < 120;
      // Smoothed pointer velocity in px/s; faster movement blows harder
      pointer.vx = fresh ? pointer.vx * 0.6 + ((px - pointer.x) / dt) * 0.4 : 0;
      pointer.vy = fresh ? pointer.vy * 0.6 + ((py - pointer.y) / dt) * 0.4 : 0;
      pointer.x = px;
      pointer.y = py;
      pointer.t = now;
      pointer.lastMove = now;
      wake();
    };

    const resizeObserver = new ResizeObserver(scheduleBuild);
    resizeObserver.observe(root);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.fonts?.ready.then(scheduleBuild);
    scheduleBuild();

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(buildRaf);
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      root.classList.remove('vapor-text--ready');
    };
  }, [text, vaporColor, breath, breathRadius, recovery, rise, turbulence, settleDamping, outlineColor, outlineWidth]);

  return (
    <Tag ref={rootRef} className={`vapor-text ${className}`}>
      <span ref={textRef} className="vapor-text__label">{text}</span>
      <canvas ref={canvasRef} className="vapor-text__canvas" aria-hidden="true" />
    </Tag>
  );
};

export default VaporText;

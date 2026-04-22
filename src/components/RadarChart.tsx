import { useEffect, useRef } from 'react';
import type { Stats } from '@/types';
import { clamp } from '@/lib/utils';

type Props = {
  stats: Stats;
  size?: number;
};

export function RadarChart({ stats, size = 160 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) / 2 - 30;
    const labels = ['產能', '士氣', '穩定', '收入', '成長'];
    const values = [
      clamp((stats.productivity + 3) / 8, 0, 1),
      clamp((stats.morale + 3) / 8, 0, 1),
      clamp((stats.stability + 3) / 8, 0, 1),
      clamp((stats.revenue + 3) / 8, 0, 1),
      clamp(((stats.productivity + stats.revenue) / 2 + 3) / 8, 0, 1),
    ];
    ctx.clearRect(0, 0, w, h);

    for (let level = 1; level <= 4; level++) {
      ctx.beginPath();
      const lr = (r * level) / 4;
      for (let i = 0; i <= 5; i++) {
        const angle = ((Math.PI * 2) / 5) * i - Math.PI / 2;
        const x = cx + lr * Math.cos(angle);
        const y = cy + lr * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(90,70,54,0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.beginPath();
    for (let i = 0; i <= 5; i++) {
      const idx = i % 5;
      const angle = ((Math.PI * 2) / 5) * idx - Math.PI / 2;
      const x = cx + r * values[idx] * Math.cos(angle);
      const y = cy + r * values[idx] * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,179,71,0.3)';
    ctx.fill();
    ctx.strokeStyle = '#f4a8b8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#5b3c2b';
    ctx.font = 'bold 11px ui-rounded, sans-serif';
    ctx.textAlign = 'center';
    for (let i = 0; i < 5; i++) {
      const angle = ((Math.PI * 2) / 5) * i - Math.PI / 2;
      const x = cx + (r + 18) * Math.cos(angle);
      const y = cy + (r + 18) * Math.sin(angle);
      ctx.fillText(labels[i], x, y + 4);
    }
  }, [stats, size]);

  return <canvas ref={canvasRef} width={size} height={size} className="block" />;
}

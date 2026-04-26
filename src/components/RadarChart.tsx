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
    // 4 軸：速度 / 專業 / 協作 / 魅力（範圍 1-10）
    const labels = ['速度', '專業', '協作', '魅力'];
    const values = [
      clamp(stats.speed / 10, 0, 1),
      clamp(stats.quality / 10, 0, 1),
      clamp(stats.teamwork / 10, 0, 1),
      clamp(stats.charisma / 10, 0, 1),
    ];
    const N = 4;
    ctx.clearRect(0, 0, w, h);

    // 繪製同心多邊形格線
    for (let level = 1; level <= 4; level++) {
      ctx.beginPath();
      const lr = (r * level) / 4;
      for (let i = 0; i <= N; i++) {
        const angle = ((Math.PI * 2) / N) * i - Math.PI / 2;
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

    // 繪製數據區域
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const idx = i % N;
      const angle = ((Math.PI * 2) / N) * idx - Math.PI / 2;
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

    // 標籤
    ctx.fillStyle = '#5b3c2b';
    ctx.font = 'bold 11px ui-rounded, sans-serif';
    ctx.textAlign = 'center';
    for (let i = 0; i < N; i++) {
      const angle = ((Math.PI * 2) / N) * i - Math.PI / 2;
      const x = cx + (r + 18) * Math.cos(angle);
      const y = cy + (r + 18) * Math.sin(angle);
      ctx.fillText(labels[i], x, y + 4);
    }
  }, [stats, size]);

  return <canvas ref={canvasRef} width={size} height={size} className="block" />;
}

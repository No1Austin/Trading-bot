"use client";
import { useEffect, useRef } from "react";

export default function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    let w = (c.width = c.offsetWidth);
    let h = (c.height = c.offsetHeight);
    const cols = Math.floor(w / 16);
    const y = Array(cols).fill(0);
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    let raf = 0;
    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#7CFFA1";
      ctx.font = "14px monospace";
      for (let i = 0; i < y.length; i++) {
        const t = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(t, i * 16, y[i]);
        y[i] = y[i] > h + Math.random() * 100 ? 0 : y[i] + 18;
      }
      raf = requestAnimationFrame(draw);
    };

    const onResize = () => {
      w = c.width = c.offsetWidth;
      h = c.height = c.offsetHeight;
    };
    window.addEventListener("resize", onResize);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 h-full w-full opacity-20" />;
}

import React, { useEffect, useState, useRef } from 'react';
import { Target } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

export const Task2FocusTracking: React.FC<Props> = ({ onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: { x: number, y: number, vx: number, vy: number, radius: number, color: string }[] = [];
    const colors = ['#4f46e5', '#8b5cf6', '#ec4899', '#0ea5e9'];

    for (let i = 0; i < 15; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        radius: Math.random() * 20 + 10,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.closePath();
      });

      // Draw a subtle focus reticle in center
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 40, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 2;
      ctx.stroke();

      requestRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col h-full items-center justify-center relative">
      <div className="w-full flex justify-end mb-2">
        <div className="bg-primary-100 text-primary-700 px-5 py-2 rounded-xl font-bold font-mono text-lg shadow-sm border border-primary-200">
          ⏱ {timeLeft}s remaining
        </div>
      </div>
      
      <div className="text-center mb-8">
        <Target className="w-12 h-12 text-primary-500 mx-auto mb-4 animate-pulse" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Focus Tracking</h3>
        <p className="text-gray-600">Keep your eyes on the screen and follow the moving shapes.</p>
      </div>

      <div className="w-full max-w-3xl aspect-[21/9] bg-gray-50 border-2 border-gray-200 rounded-3xl overflow-hidden relative shadow-inner">
        <canvas 
          ref={canvasRef}
          width={800}
          height={340}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

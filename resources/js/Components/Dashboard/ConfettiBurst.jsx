import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const COLORS = ['#0F766E', '#10B981', '#2563EB', '#7C3AED', '#F59E0B', '#EC4899', '#EF4444', '#06B6D4'];

export default function ConfettiBurst({ trigger = 0 }) {
    const [pieces, setPieces] = useState([]);

    useEffect(() => {
        if (!trigger) return;
        const generated = Array.from({ length: 34 }, (_, i) => {
            const angle = (Math.PI * 2 * i) / 34 + (Math.random() - 0.5) * 0.3;
            const distance = 90 + Math.random() * 170;
            return {
                id: `${trigger}-${i}`,
                x: 40 + Math.random() * 20,
                y: 28 + Math.random() * 16,
                dx: Math.cos(angle) * distance,
                dy: Math.sin(angle) * distance - 40,
                rot: Math.floor(Math.random() * 540 - 270),
                color: COLORS[i % COLORS.length],
                size: 6 + Math.random() * 6,
                isCircle: i % 3 === 0,
                delay: Math.random() * 120,
            };
        });
        setPieces(generated);
        const timer = setTimeout(() => setPieces([]), 1650);
        return () => clearTimeout(timer);
    }, [trigger]);

    if (!pieces.length || typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden" aria-hidden="true">
            <style>{`
                @keyframes fieldy-confetti-pop {
                    0% { opacity: 1; transform: translate3d(0, 0, 0) rotate(0deg) scale(0.7); }
                    20% { opacity: 1; transform: translate3d(calc(var(--dx) * 0.45), calc(var(--dy) * 0.45), 0) rotate(calc(var(--rot) * 0.4)) scale(1.1); }
                    100% { opacity: 0; transform: translate3d(var(--dx), calc(var(--dy) + 180px), 0) rotate(var(--rot)) scale(0.5); }
                }
            `}</style>
            {pieces.map((p) => (
                <span
                    key={p.id}
                    style={{
                        position: 'fixed',
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.isCircle ? p.size : p.size * 0.55,
                        borderRadius: p.isCircle ? '9999px' : '2px',
                        backgroundColor: p.color,
                        '--dx': `${p.dx}px`,
                        '--dy': `${p.dy}px`,
                        '--rot': `${p.rot}deg`,
                        animation: `fieldy-confetti-pop 1.45s cubic-bezier(0.16, 0.84, 0.44, 1) ${p.delay}ms forwards`,
                    }}
                />
            ))}
        </div>,
        document.body
    );
}

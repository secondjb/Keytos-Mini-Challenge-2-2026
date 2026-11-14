import React from 'react';
import {
  Star,
  Heart,
  Triangle,
  Circle,
  Diamond,
  ArrowRight,
  Square,
  Hexagon,
} from 'lucide-react';
import { SHAPES, WORDS } from '../utils/captchaPatterns';

// Icon map for shape visuals
const SHAPE_ICONS = {
  star: Star,
  heart: Heart,
  triangle: Triangle,
  circle: Circle,
  diamond: Diamond,
  arrow: ArrowRight,
  square: Square,
  hexagon: Hexagon,
};

export default function DecoyAnswerGrid({
  mode = 'shape',
  onSelectAnswer,
  disabled = false,
  targetId,
}) {
  const items = mode === 'shape' ? SHAPES : WORDS;

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between text-xs font-mono text-slate-400">
        <span>Select the perceived {mode}:</span>
        <span className="text-[11px] text-slate-500">1 of {items.length} choices</span>
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        {items.map((item) => {
          const IconComponent = mode === 'shape' ? SHAPE_ICONS[item.id] : null;

          return (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectAnswer(item.id)}
              className="group relative flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 active:scale-95 border border-slate-700/60 hover:border-cyan-500/50 shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {/* Visual Icon (for shape mode) */}
              {IconComponent && (
                <IconComponent className="w-6 h-6 text-cyan-300 group-hover:scale-110 group-hover:text-cyan-200 transition-transform mb-1.5" />
              )}

              {/* 
                DECOY DOM VS REAL RENDER:
                The actual DOM text is decoyLabel (e.g. Hexagon when visually it is Star).
                The human-visible text is rendered purely via CSS ::before with attr(data-visual).
                A scraper inspecting the DOM text content will read the decoy label!
              */}
              <div className="relative text-xs font-mono font-medium text-slate-200 group-hover:text-white">
                {/* 1. Scraper reads this raw DOM text */}
                <span className="sr-only select-none">{item.decoyLabel}</span>

                {/* 2. Visual human sees this via CSS ::before */}
                <span
                  className="visual-label inline-block"
                  data-visual={item.label}
                  aria-hidden="true"
                />
              </div>

              {/* Sub-label showing decoy badge only to scrapers */}
              <span
                style={{
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  padding: 0,
                  margin: '-1px',
                  overflow: 'hidden',
                  clip: 'rect(0, 0, 0, 0)',
                  whiteSpace: 'nowrap',
                  border: 0,
                }}
              >
                {item.decoyLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

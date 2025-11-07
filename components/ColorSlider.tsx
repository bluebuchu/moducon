import React from 'react';

interface ColorSliderProps {
  label: 'R' | 'G' | 'B';
  value: number;
  onChange: (value: number) => void;
  color: string;
}

const ColorSlider: React.FC<ColorSliderProps> = ({ label, value, onChange, color }) => {
  return (
    <div className="flex items-center gap-3 w-full">
      <span className={`font-bold w-4 text-${color}-500`}>{label}</span>
      <input
        type="range"
        min="0"
        max="255"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`flex-grow h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-${color}-500`}
        style={{ accentColor: color === 'red' ? '#ef4444' : color === 'green' ? '#22c55e' : '#3b82f6' }}
      />
      <span className="w-8 text-right font-mono text-sm">{value}</span>
    </div>
  );
};

export default ColorSlider;
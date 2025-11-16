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
      <span className={`font-bold w-4 ${color === 'red' ? 'text-red-600' : color === 'green' ? 'text-green-600' : 'text-blue-600'}`}>{label}</span>
      <input
        type="range"
        min="0"
        max="255"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        style={{ accentColor: color === 'red' ? '#dc2626' : color === 'green' ? '#16a34a' : '#2563eb' }}
      />
      <span className="w-12 text-right font-mono text-sm text-gray-700">{value}</span>
    </div>
  );
};

export default ColorSlider;
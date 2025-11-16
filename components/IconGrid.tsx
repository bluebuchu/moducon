import React from 'react';
import { Icon } from '../types';

interface IconGridProps {
  icons: Icon[];
  selectedIcons: number[];
  onIconClick?: (iconId: number) => void;
  disabled?: boolean;
  showSelection?: boolean;
}

const IconGrid: React.FC<IconGridProps> = ({ 
  icons, 
  selectedIcons, 
  onIconClick, 
  disabled = false,
  showSelection = false 
}) => {
  return (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-4 p-4 max-w-4xl mx-auto">
      {icons.map((icon) => {
        const isSelected = selectedIcons.includes(icon.id);
        const isDisabled = disabled || (showSelection && isSelected);
        
        return (
          <button
            key={icon.id}
            onClick={() => onIconClick?.(icon.id)}
            disabled={isDisabled}
            className={`
              relative aspect-square rounded-2xl p-4 
              flex flex-col items-center justify-center
              transition-all duration-200 transform overflow-hidden
              ${isSelected 
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 ring-4 ring-indigo-400 scale-95' 
                : 'bg-slate-800 hover:bg-slate-700 hover:scale-105'}
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              shadow-lg hover:shadow-xl
            `}
          >
            {/* Icon Image */}
            {icon.imagePath ? (
              <div className="w-16 h-16 md:w-20 md:h-20 mb-2 relative">
                <img
                  src={icon.imagePath}
                  alt={icon.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                <div className="hidden text-3xl md:text-4xl text-center">
                  {icon.emoji || '🏢'}
                </div>
              </div>
            ) : (
              <div className="text-4xl md:text-5xl mb-2">
                {icon.emoji || '🏢'}
              </div>
            )}
            
            {/* Icon Name */}
            <span className={`text-xs md:text-sm font-medium text-center leading-tight ${isSelected ? 'text-white' : 'text-slate-300'}`}>
              {icon.name}
            </span>
            
            {/* Color Palette Preview */}
            <div className="flex gap-1 mt-2">
              {icon.colors.slice(0, 3).map((color, idx) => (
                <div
                  key={idx}
                  className="w-3 h-3 rounded-full shadow-sm border border-white/20"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            
            {/* Selected Indicator */}
            {isSelected && showSelection && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default IconGrid;
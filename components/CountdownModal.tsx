import React, { useState, useEffect } from 'react';

interface CountdownModalProps {
  isVisible: boolean;
  onComplete: () => void;
}

const CountdownModal: React.FC<CountdownModalProps> = ({ isVisible, onComplete }) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (!isVisible) return;
    
    setCount(3);
    const interval = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <div className="text-8xl font-bold text-white mb-4 animate-pulse">
          {count > 0 ? count : 'GO!'}
        </div>
        <p className="text-xl text-gray-300">게임을 시작합니다...</p>
      </div>
    </div>
  );
};

export default CountdownModal;
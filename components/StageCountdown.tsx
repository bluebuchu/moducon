import React, { useState, useEffect } from 'react';

interface StageCountdownProps {
  isVisible: boolean;
  stageName: string;
  onComplete: () => void;
}

const StageCountdown: React.FC<StageCountdownProps> = ({ isVisible, stageName, onComplete }) => {
  const [count, setCount] = useState(3);
  const [stage, setStage] = useState<'showing' | 'counting' | 'go'>('showing');

  useEffect(() => {
    if (!isVisible) return;
    
    setCount(3);
    setStage('showing');

    // Stage name display for 2 seconds
    const stageTimer = setTimeout(() => {
      setStage('counting');
      
      // Countdown 3-2-1
      const interval = setInterval(() => {
        setCount(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setStage('go');
            
            // Show "GO!" for 1 second then complete
            setTimeout(() => {
              onComplete();
            }, 1000);
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 2000);

    return () => {
      clearTimeout(stageTimer);
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-blue-900/70 to-purple-900/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        {stage === 'showing' && (
          <div className="animate-pulse">
            <div className="text-6xl font-bold text-white mb-6 drop-shadow-2xl">
              {stageName}
            </div>
            <div className="text-xl text-blue-200">
              단계가 시작됩니다...
            </div>
          </div>
        )}
        
        {stage === 'counting' && (
          <div className="animate-bounce">
            <div className="text-8xl font-bold text-white mb-4 drop-shadow-2xl">
              {count}
            </div>
            <div className="text-xl text-gray-300">
              준비하세요!
            </div>
          </div>
        )}
        
        {stage === 'go' && (
          <div className="animate-pulse">
            <div className="text-8xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent drop-shadow-2xl">
              GO!
            </div>
            <div className="text-xl text-green-400">
              시작합니다!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StageCountdown;
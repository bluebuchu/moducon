import React, { useState, useEffect } from 'react';
import { User, Save } from 'lucide-react';

interface NicknameModalProps {
  isOpen: boolean;
  onSubmit: (nickname: string) => void;
  time: number;
  accuracy: number;
  stage: number;
  lang: 'EN' | 'ES';
}

const NicknameModal: React.FC<NicknameModalProps> = ({
  isOpen,
  onSubmit,
  time,
  accuracy,
  stage,
  lang
}) => {
  const [nickname, setNickname] = useState('');
  
  // 모달이 열릴 때 닉네임 초기화
  useEffect(() => {
    if (isOpen) {
      console.log('🎯 [NicknameModal] 모달 열림 - 닉네임 초기화');
      setNickname('');
    }
  }, [isOpen]);
  
  console.log('🏷️ [NicknameModal] 현재 닉네임:', nickname, '길이:', nickname.trim().length);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    const trimmed = nickname.trim();
    console.log('💾 [NicknameModal] 저장 시도:', { nickname, trimmed, length: trimmed.length });
    
    if (trimmed.length > 0 && trimmed.length <= 10) {
      console.log('✅ [NicknameModal] 저장 조건 충족, onSubmit 호출');
      onSubmit(trimmed);
    } else {
      console.warn('❌ [NicknameModal] 저장 조건 미충족:', { length: trimmed.length });
    }
  };

  const t = {
    EN: {
      title: 'Stage Completed!',
      enterNickname: 'Enter your nickname for the leaderboard',
      placeholder: 'Nickname (1-10 chars)',
      time: 'Time',
      accuracy: 'Accuracy',
      save: 'Save to Leaderboard',
      skip: 'Skip'
    },
    ES: {
      title: '¡Etapa Completada!',
      enterNickname: 'Ingresa tu apodo para la tabla de clasificación',
      placeholder: 'Apodo (1-10 caracteres)',
      time: 'Tiempo',
      accuracy: 'Precisión',
      save: 'Guardar en Clasificación',
      skip: 'Omitir'
    }
  };

  const txt = t[lang];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-green-400 to-indigo-400 bg-clip-text text-transparent">
          {txt.title}
        </h2>

        <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400">{txt.time}:</span>
            <span className="font-mono text-xl">{formatTime(time)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">{txt.accuracy}:</span>
            <span className="font-mono text-xl text-green-400">{accuracy.toFixed(1)}%</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 block mb-2">
              {txt.enterNickname}
            </label>
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2 border border-slate-700 focus-within:border-indigo-500 transition">
              <User size={16} className="text-slate-500" />
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  const newValue = e.target.value.slice(0, 10);
                  console.log('✏️ [NicknameModal] 입력 변경:', { old: nickname, new: newValue });
                  setNickname(newValue);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder={txt.placeholder}
                className="bg-transparent flex-1 outline-none text-white placeholder:text-slate-600"
                autoFocus
                maxLength={10}
              />
              <span className="text-xs text-slate-500">
                {nickname.length}/10
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onSubmit('')}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition"
            >
              {txt.skip}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!nickname.trim() || nickname.trim().length === 0}
              className={`flex-1 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2
                ${nickname.trim().length > 0
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
            >
              <Save size={18} />
              {txt.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NicknameModal;
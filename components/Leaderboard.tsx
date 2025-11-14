import React, { useState, useEffect } from 'react';
import { Trophy, Clock, User, X } from 'lucide-react';

interface LeaderboardEntry {
  nickname: string;
  stage: number;
  time: number; // in seconds
  date: number; // timestamp
  accuracy: number;
}

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentStage?: number;
  lang: 'EN' | 'ES';
}

const STORAGE_KEY = 'cdc_leaderboard_v1';

const Leaderboard: React.FC<LeaderboardProps> = ({ isOpen, onClose, currentStage, lang }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filterStage, setFilterStage] = useState<number | 'all'>(currentStage || 'all');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredEntries = filterStage === 'all' 
    ? entries 
    : entries.filter(e => e.stage === filterStage);

  const sortedEntries = [...filteredEntries].sort((a, b) => a.time - b.time).slice(0, 10);

  const t = {
    EN: {
      title: 'Leaderboard',
      stage: 'Stage',
      allStages: 'All Stages',
      nickname: 'Player',
      time: 'Time',
      accuracy: 'Accuracy',
      noRecords: 'No records yet',
      close: 'Close'
    },
    ES: {
      title: 'Tabla de Clasificación',
      stage: 'Etapa',
      allStages: 'Todas las Etapas',
      nickname: 'Jugador',
      time: 'Tiempo',
      accuracy: 'Precisión',
      noRecords: 'Sin registros aún',
      close: 'Cerrar'
    }
  };

  const txt = t[lang];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="text-yellow-500" size={24} />
              <h2 className="text-2xl font-bold">{txt.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setFilterStage('all')}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                filterStage === 'all' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              {txt.allStages}
            </button>
            {[1, 2, 3].map(stage => (
              <button
                key={stage}
                onClick={() => setFilterStage(stage)}
                className={`px-3 py-1 rounded-lg text-sm transition ${
                  filterStage === stage 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                {txt.stage} {stage}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {sortedEntries.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              {txt.noRecords}
            </div>
          ) : (
            <div className="space-y-2">
              {sortedEntries.map((entry, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg flex items-center gap-4 ${
                    index === 0 ? 'bg-yellow-500/10 border border-yellow-500/20' :
                    index === 1 ? 'bg-slate-500/10 border border-slate-500/20' :
                    index === 2 ? 'bg-orange-500/10 border border-orange-500/20' :
                    'bg-slate-800/50'
                  }`}
                >
                  <div className={`text-2xl font-bold w-8 text-center ${
                    index === 0 ? 'text-yellow-500' :
                    index === 1 ? 'text-slate-400' :
                    index === 2 ? 'text-orange-500' :
                    'text-slate-600'
                  }`}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-slate-500" />
                      <span className="font-medium">{entry.nickname}</span>
                      {filterStage === 'all' && (
                        <span className="text-xs bg-slate-800 px-2 py-0.5 rounded">
                          {txt.stage} {entry.stage}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm">
                      <Clock size={14} className="text-slate-500" />
                      <span className="font-mono">{formatTime(entry.time)}</span>
                    </div>
                    <div className="text-sm font-mono text-green-400">
                      {entry.accuracy.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const addLeaderboardEntry = (entry: Omit<LeaderboardEntry, 'date'>) => {
  const saved = localStorage.getItem(STORAGE_KEY);
  const entries: LeaderboardEntry[] = saved ? JSON.parse(saved) : [];
  
  entries.push({
    ...entry,
    date: Date.now()
  });
  
  // Keep only top 50 entries per stage
  const grouped = entries.reduce((acc, e) => {
    if (!acc[e.stage]) acc[e.stage] = [];
    acc[e.stage].push(e);
    return acc;
  }, {} as Record<number, LeaderboardEntry[]>);
  
  const trimmed: LeaderboardEntry[] = [];
  Object.entries(grouped).forEach(([stage, stageEntries]) => {
    const sorted = stageEntries.sort((a, b) => a.time - b.time).slice(0, 50);
    trimmed.push(...sorted);
  });
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
};

export default Leaderboard;